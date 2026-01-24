package com.eventhub.service;

import com.eventhub.dto.request.CreateLeadRequest;
import com.eventhub.dto.response.LeadAcceptanceResponse;
import com.eventhub.dto.response.RefundResponse;
import com.eventhub.exception.BusinessRuleException;
import com.eventhub.model.Lead;
import com.eventhub.model.Order;
import com.eventhub.model.Payment;
import com.eventhub.model.Vendor;
import com.eventhub.repository.LeadRepository;
import com.eventhub.repository.OrderRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LeadService {
    
    private final LeadRepository leadRepository;
    private final VendorRepository vendorRepository;
    private final OrderRepository orderRepository;
    private final TokenPaymentService tokenPaymentService;
    private final NotificationService notificationService;
    private final DistanceService distanceService;
    
    public Lead createLead(CreateLeadRequest request) {
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        Lead lead = new Lead();
        lead.setVendor(vendor);
        lead.setUserId(request.getVendorId()); // Can be null for anonymous
        lead.setName(request.getName());
        lead.setEmail(request.getEmail());
        lead.setPhone(request.getPhone());
        lead.setEventType(request.getEventType());
        lead.setEventDate(request.getEventDate());
        lead.setVenueAddress(request.getVenueAddress());
        lead.setGuestCount(request.getGuestCount());
        lead.setBudget(request.getBudget());
        lead.setMessage(request.getMessage());
        lead.setStatus(Lead.LeadStatus.NEW);
        
        // Set customer location if provided
        if (request.getCustomerLocationName() != null) {
            lead.setCustomerLocationName(request.getCustomerLocationName());
        }
        if (request.getCustomerLocationLat() != null && request.getCustomerLocationLng() != null) {
            lead.setCustomerLocationLat(request.getCustomerLocationLat());
            lead.setCustomerLocationLng(request.getCustomerLocationLng());
            
            // Calculate distance from vendor
            if (vendor.getLocationLat() != null && vendor.getLocationLng() != null) {
                double distance = distanceService.calculateDistance(
                        vendor.getLocationLat(), vendor.getLocationLng(),
                        request.getCustomerLocationLat(), request.getCustomerLocationLng());
                lead.setDistanceKm(BigDecimal.valueOf(Math.round(distance * 10.0) / 10.0));
            }
        }
        
        return leadRepository.save(lead);
    }
    
    /**
     * Create a lead from a direct order after token payment
     */
    public Lead createLeadFromOrder(Order order, Payment tokenPayment) {
        log.info("Creating lead from order: {} with token payment: {}", order.getId(), tokenPayment.getId());
        
        // Check if lead already exists for this order
        Lead existingLead = leadRepository.findByOrder(order).orElse(null);
        if (existingLead != null) {
            log.warn("Lead already exists for order: {}", order.getId());
            return existingLead;
        }
        
        Lead lead = new Lead();
        lead.setVendor(order.getVendor());
        lead.setUserId(order.getUserId());
        lead.setOrder(order);
        lead.setListing(order.getListing());
        lead.setSource(Lead.LeadSource.DIRECT_ORDER);
        lead.setStatus(Lead.LeadStatus.NEW);
        
        // Copy customer details from order
        lead.setName(order.getCustomerName());
        lead.setEmail(order.getCustomerEmail());
        lead.setPhone(order.getCustomerPhone());
        lead.setEventType(order.getEventType());
        lead.setEventDate(order.getEventDate());
        lead.setVenueAddress(order.getVenueAddress());
        lead.setGuestCount(order.getGuestCount());
        lead.setMessage(order.getNotes());
        
        // Set token amount from payment
        lead.setTokenAmount(tokenPayment.getAmount());
        
        // Set budget based on order total
        lead.setBudget(order.getTotalAmount().toString());
        
        lead = leadRepository.save(lead);
        
        log.info("Lead {} created from order {} with token amount {}", 
                lead.getId(), order.getId(), tokenPayment.getAmount());
        
        // Notify vendor about new lead
        try {
            notificationService.notifyVendorNewLead(lead, tokenPayment);
        } catch (Exception e) {
            log.error("Failed to send notification for lead {}: {}", lead.getId(), e.getMessage());
        }
        
        return lead;
    }
    
    @Transactional(readOnly = true)
    public List<Lead> getCustomerLeads(UUID userId) {
        return leadRepository.findByUserId(userId);
    }
    
    @Transactional(readOnly = true)
    public List<Lead> getVendorLeads(UUID vendorId, int page, int size) {
        // Use optimized query with JOIN FETCH to avoid lazy loading issues
        return leadRepository.findByVendorIdOptimized(
            vendorId, 
            org.springframework.data.domain.PageRequest.of(page, size)
        );
    }
    
    @Transactional(readOnly = true)
    public List<Lead> getVendorLeads(UUID vendorId) {
        return getVendorLeads(vendorId, 0, 20);
    }
    
    @Transactional(readOnly = true)
    public Lead getLeadById(UUID leadId, UUID vendorId) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new NotFoundException("Lead not found"));
        
        // Validate lead belongs to vendor
        if (!lead.getVendor().getId().equals(vendorId)) {
            throw new BusinessRuleException("Lead does not belong to this vendor");
        }
        
        return lead;
    }
    
    public Lead updateLeadStatus(UUID leadId, Lead.LeadStatus status) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new NotFoundException("Lead not found"));
        lead.setStatus(status);
        return leadRepository.save(lead);
    }
    
    /**
     * Accept a lead - confirms the associated order
     */
    public LeadAcceptanceResponse acceptLead(UUID leadId, UUID vendorId) {
        Lead lead = getLeadById(leadId, vendorId);
        
        // Validate lead status
        if (lead.getStatus() != Lead.LeadStatus.NEW && lead.getStatus() != Lead.LeadStatus.OPEN) {
            throw new BusinessRuleException("Lead cannot be accepted in current status: " + lead.getStatus());
        }
        
        // Update lead status
        lead.setStatus(Lead.LeadStatus.CONVERTED);
        leadRepository.save(lead);
        
        // If lead has associated order, confirm it
        Order order = lead.getOrder();
        if (order != null) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
            order.setAwaitingTokenPayment(false);
            orderRepository.save(order);
            
            log.info("Lead {} accepted. Order {} confirmed.", leadId, order.getId());
            
            // Notify user about acceptance
            try {
                notificationService.notifyUserLeadAccepted(lead);
            } catch (Exception e) {
                log.error("Failed to send acceptance notification for lead {}: {}", leadId, e.getMessage());
            }
            
            return LeadAcceptanceResponse.builder()
                    .leadId(leadId)
                    .orderId(order.getId())
                    .leadStatus(lead.getStatus().name())
                    .orderStatus(order.getStatus().name())
                    .message("Lead accepted and order confirmed successfully")
                    .order(order)
                    .lead(lead)
                    .build();
        }
        
        log.info("Lead {} accepted (no associated order).", leadId);
        
        return LeadAcceptanceResponse.builder()
                .leadId(leadId)
                .leadStatus(lead.getStatus().name())
                .message("Lead accepted successfully")
                .lead(lead)
                .build();
    }
    
    /**
     * Reject a lead - initiates refund if token was paid
     */
    public Lead rejectLead(UUID leadId, UUID vendorId, String reason) {
        Lead lead = getLeadById(leadId, vendorId);
        
        // Validate lead status
        if (lead.getStatus() == Lead.LeadStatus.CONVERTED) {
            throw new BusinessRuleException("Cannot reject a converted lead");
        }
        
        // Update lead status
        lead.setStatus(Lead.LeadStatus.DECLINED);
        leadRepository.save(lead);
        
        // If lead has associated order with token payment, initiate refund
        Order order = lead.getOrder();
        if (order != null && order.getTokenPaid() != null && order.getTokenPaid().compareTo(java.math.BigDecimal.ZERO) > 0) {
            try {
                RefundResponse refundResponse = tokenPaymentService.initiateRefund(
                        order.getId(), 
                        order.getUserId(), 
                        "Vendor declined: " + reason
                );
                log.info("Lead {} rejected. Refund initiated for order {}: {}", 
                        leadId, order.getId(), refundResponse.getRefundAmount());
                
                // Notify user about rejection and refund
                try {
                    notificationService.notifyUserLeadRejected(lead, refundResponse.getRefundAmount());
                } catch (Exception e) {
                    log.error("Failed to send rejection notification for lead {}: {}", leadId, e.getMessage());
                }
            } catch (Exception e) {
                log.error("Failed to initiate refund for order {}: {}", order.getId(), e.getMessage());
                // Continue with lead rejection even if refund fails
            }
        } else if (order != null) {
            // Cancel order without refund
            order.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(order);
            log.info("Lead {} rejected. Order {} cancelled (no token payment).", leadId, order.getId());
        }
        
        return lead;
    }
}

