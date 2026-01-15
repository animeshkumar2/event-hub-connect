package com.eventhub.service;

import com.eventhub.dto.request.CreateOfferRequest;
import com.eventhub.dto.request.CounterOfferRequest;
import com.eventhub.dto.response.OfferDTO;
import com.eventhub.exception.NotFoundException;
import com.eventhub.exception.BusinessRuleException;
import com.eventhub.model.*;
import com.eventhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OfferService {
    
    private final OfferRepository offerRepository;
    private final ChatThreadRepository chatThreadRepository;
    private final ListingRepository listingRepository;
    private final VendorRepository vendorRepository;
    private final LeadRepository leadRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderTimelineRepository orderTimelineRepository;
    private final UserProfileRepository userProfileRepository;
    
    /**
     * Create a new offer from user
     */
    public Offer createOffer(UUID userId, CreateOfferRequest request) {
        // Validate thread exists and belongs to user
        ChatThread thread = chatThreadRepository.findById(request.getThreadId())
                .orElseThrow(() -> new NotFoundException("Chat thread not found"));
        
        if (!thread.getUserId().equals(userId)) {
            throw new BusinessRuleException("You don't have permission to make offers in this thread");
        }
        
        // Validate listing exists
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new NotFoundException("Listing not found"));
        
        if (!listing.getIsActive()) {
            throw new BusinessRuleException("Listing is not active");
        }
        
        // Validate vendor matches thread
        if (!thread.getVendor().getId().equals(listing.getVendor().getId())) {
            throw new BusinessRuleException("Listing does not belong to the vendor in this thread");
        }
        
        // Determine base price for validation (use customized price if provided, otherwise original)
        BigDecimal basePrice = listing.getPrice();
        BigDecimal customizedPrice = request.getCustomizedPrice();
        
        // If customization is provided, use customized price for validation
        if (customizedPrice != null && customizedPrice.compareTo(BigDecimal.ZERO) > 0) {
            basePrice = customizedPrice;
            // Validate customized price is reasonable (at least base price)
            if (customizedPrice.compareTo(listing.getPrice()) < 0) {
                throw new BusinessRuleException("Customized price cannot be less than original price");
            }
        } else {
            // No customization, set customized price to original price
            customizedPrice = listing.getPrice();
        }
        
        // Validate offered price is less than base price (customized or original)
        if (request.getOfferedPrice().compareTo(basePrice) >= 0) {
            throw new BusinessRuleException("Offered price must be less than the base price");
        }
        
        // Check if there's already an active offer for this specific listing in this thread
        List<Offer> existingOffers = offerRepository.findActiveOffersByThreadAndListing(thread.getId(), listing.getId());
        if (!existingOffers.isEmpty()) {
            Offer existingOffer = existingOffers.get(0);
            throw new BusinessRuleException("You already have an active offer for this listing. Please withdraw the existing offer or wait for vendor response before creating a new one.");
        }
        
        // Create offer
        Offer offer = new Offer();
        offer.setThread(thread);
        offer.setListing(listing);
        offer.setUserId(userId);
        offer.setVendor(listing.getVendor());
        offer.setOfferedPrice(request.getOfferedPrice());
        offer.setOriginalPrice(listing.getPrice());
        offer.setCustomizedPrice(customizedPrice);
        offer.setCustomization(request.getCustomization());
        offer.setMessage(request.getMessage());
        offer.setEventType(request.getEventType());
        offer.setEventDate(request.getEventDate());
        offer.setEventTime(request.getEventTime());
        offer.setVenueAddress(request.getVenueAddress());
        offer.setGuestCount(request.getGuestCount());
        offer.setStatus(Offer.OfferStatus.PENDING);
        
        // Create or update lead
        Lead lead = createOrUpdateLeadFromOffer(offer, thread);
        offer.setLeadId(lead.getId());
        
        return offerRepository.save(offer);
    }
    
    /**
     * Vendor accepts an offer
     */
    public Offer acceptOffer(UUID vendorId, UUID offerId) {
        Offer offer = offerRepository.findByIdAndVendorId(offerId, vendorId)
                .orElseThrow(() -> new NotFoundException("Offer not found"));
        
        if (offer.getStatus() != Offer.OfferStatus.PENDING && offer.getStatus() != Offer.OfferStatus.COUNTERED) {
            throw new BusinessRuleException("Only pending or countered offers can be accepted");
        }
        
        // Update offer status
        offer.setStatus(Offer.OfferStatus.ACCEPTED);
        offer.setAcceptedAt(LocalDateTime.now());
        
        // Create order from accepted offer (order will be in PENDING status awaiting token payment)
        Order order = createOrderFromOffer(offer);
        offer.setOrderId(order.getId());
        
        // Update lead status to OPEN (waiting for token payment, not CONVERTED yet)
        if (offer.getLeadId() != null) {
            Lead lead = leadRepository.findById(offer.getLeadId())
                    .orElse(null);
            if (lead != null) {
                lead.setStatus(Lead.LeadStatus.OPEN);
                lead.setOrder(order); // Link lead to order
                lead.setSource(Lead.LeadSource.OFFER);
                leadRepository.save(lead);
            }
        }
        
        // Update thread with order reference
        ChatThread thread = offer.getThread();
        thread.setOrderId(order.getId());
        if (thread.getLeadId() == null && offer.getLeadId() != null) {
            thread.setLeadId(offer.getLeadId());
        }
        chatThreadRepository.save(thread);
        
        return offerRepository.save(offer);
    }
    
    /**
     * Vendor rejects an offer
     */
    public Offer rejectOffer(UUID vendorId, UUID offerId) {
        Offer offer = offerRepository.findByIdAndVendorId(offerId, vendorId)
                .orElseThrow(() -> new NotFoundException("Offer not found"));
        
        if (offer.getStatus() != Offer.OfferStatus.PENDING && offer.getStatus() != Offer.OfferStatus.COUNTERED) {
            throw new BusinessRuleException("Only pending or countered offers can be rejected");
        }
        
        offer.setStatus(Offer.OfferStatus.REJECTED);
        offer.setRejectedAt(LocalDateTime.now());
        
        // Update lead status to DECLINED when vendor rejects (move to closed)
        if (offer.getLeadId() != null) {
            Lead lead = leadRepository.findById(offer.getLeadId()).orElse(null);
            if (lead != null) {
                lead.setStatus(Lead.LeadStatus.DECLINED);
                leadRepository.save(lead);
            }
        }
        
        return offerRepository.save(offer);
    }
    
    /**
     * Vendor makes a counter offer
     */
    public Offer counterOffer(UUID vendorId, UUID offerId, CounterOfferRequest request) {
        Offer offer = offerRepository.findByIdAndVendorId(offerId, vendorId)
                .orElseThrow(() -> new NotFoundException("Offer not found"));
        
        if (offer.getStatus() != Offer.OfferStatus.PENDING) {
            throw new BusinessRuleException("Only pending offers can be countered");
        }
        
        // Validate counter price is between offered price and original price
        if (request.getCounterPrice().compareTo(offer.getOfferedPrice()) <= 0) {
            throw new BusinessRuleException("Counter price must be greater than the offered price");
        }
        
        if (request.getCounterPrice().compareTo(offer.getOriginalPrice()) >= 0) {
            throw new BusinessRuleException("Counter price must be less than the original price");
        }
        
        offer.setStatus(Offer.OfferStatus.COUNTERED);
        offer.setCounterPrice(request.getCounterPrice());
        offer.setCounterMessage(request.getCounterMessage());
        
        // Update lead status to OPEN when vendor counters (update existing lead, not create new)
        if (offer.getLeadId() != null) {
            Lead lead = leadRepository.findById(offer.getLeadId()).orElse(null);
            if (lead != null) {
                lead.setStatus(Lead.LeadStatus.OPEN);
                leadRepository.save(lead);
            }
        }
        
        return offerRepository.save(offer);
    }
    
    /**
     * User accepts a counter offer
     */
    public Offer acceptCounterOffer(UUID userId, UUID offerId) {
        Offer offer = offerRepository.findByIdAndUserId(offerId, userId)
                .orElseThrow(() -> new NotFoundException("Offer not found"));
        
        if (offer.getStatus() != Offer.OfferStatus.COUNTERED) {
            throw new BusinessRuleException("This offer is not a counter offer");
        }
        
        // Update offered price to counter price and accept
        offer.setOfferedPrice(offer.getCounterPrice());
        offer.setStatus(Offer.OfferStatus.ACCEPTED);
        offer.setAcceptedAt(LocalDateTime.now());
        
        // Create order from accepted offer (order will be in PENDING status awaiting token payment)
        Order order = createOrderFromOffer(offer);
        offer.setOrderId(order.getId());
        
        // Update lead status to OPEN (waiting for token payment, not CONVERTED yet)
        if (offer.getLeadId() != null) {
            Lead lead = leadRepository.findById(offer.getLeadId())
                    .orElse(null);
            if (lead != null) {
                lead.setStatus(Lead.LeadStatus.OPEN);
                lead.setOrder(order); // Link lead to order
                lead.setSource(Lead.LeadSource.OFFER);
                leadRepository.save(lead);
            }
        }
        
        // Update thread with order reference
        ChatThread thread = offer.getThread();
        thread.setOrderId(order.getId());
        if (thread.getLeadId() == null && offer.getLeadId() != null) {
            thread.setLeadId(offer.getLeadId());
        }
        chatThreadRepository.save(thread);
        
        return offerRepository.save(offer);
    }
    
    /**
     * User counters back (updates their offer price in response to vendor counter)
     */
    public Offer userCounterOffer(UUID userId, UUID offerId, CounterOfferRequest request) {
        Offer offer = offerRepository.findByIdAndUserId(offerId, userId)
                .orElseThrow(() -> new NotFoundException("Offer not found"));
        
        if (offer.getStatus() != Offer.OfferStatus.COUNTERED) {
            throw new BusinessRuleException("You can only counter back when vendor has countered your offer");
        }
        
        // Validate new offered price is between vendor's counter and original price
        if (request.getCounterPrice().compareTo(offer.getCounterPrice()) >= 0) {
            throw new BusinessRuleException("Your counter price must be less than the vendor's counter price");
        }
        if (request.getCounterPrice().compareTo(offer.getOfferedPrice()) <= 0) {
            throw new BusinessRuleException("Your counter price must be greater than your previous offer");
        }
        
        // Update offered price to user's new counter
        offer.setOfferedPrice(request.getCounterPrice());
        offer.setCounterPrice(null); // Clear vendor's counter
        offer.setCounterMessage(null);
        offer.setStatus(Offer.OfferStatus.PENDING); // Back to pending, waiting for vendor
        
        // Update lead status back to NEW (user is making a new offer)
        if (offer.getLeadId() != null) {
            Lead lead = leadRepository.findById(offer.getLeadId()).orElse(null);
            if (lead != null) {
                lead.setStatus(Lead.LeadStatus.NEW);
                lead.setBudget(request.getCounterPrice().toString());
                leadRepository.save(lead);
            }
        }
        
        return offerRepository.save(offer);
    }
    
    /**
     * User withdraws their offer
     */
    public Offer withdrawOffer(UUID userId, UUID offerId) {
        Offer offer = offerRepository.findByIdAndUserId(offerId, userId)
                .orElseThrow(() -> new NotFoundException("Offer not found"));
        
        if (offer.getStatus() != Offer.OfferStatus.PENDING && offer.getStatus() != Offer.OfferStatus.COUNTERED) {
            throw new BusinessRuleException("Only pending or countered offers can be withdrawn");
        }
        
        offer.setStatus(Offer.OfferStatus.WITHDRAWN);
        
        // Update lead status to WITHDRAWN when user withdraws (move to closed)
        if (offer.getLeadId() != null) {
            Lead lead = leadRepository.findById(offer.getLeadId()).orElse(null);
            if (lead != null) {
                lead.setStatus(Lead.LeadStatus.WITHDRAWN);
                leadRepository.save(lead);
            }
        }
        
        return offerRepository.save(offer);
    }
    
    /**
     * Get offers for a thread
     */
    @Transactional(readOnly = true)
    public List<OfferDTO> getOffersByThread(UUID threadId) {
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new NotFoundException("Chat thread not found"));
        
        List<Offer> offers = offerRepository.findByThreadOrderByCreatedAtDesc(thread);
        return offers.stream()
                .map(OfferDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get offers for a vendor
     */
    @Transactional(readOnly = true)
    public List<OfferDTO> getVendorOffers(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        List<Offer> offers = offerRepository.findByVendorOrderByCreatedAtDesc(vendor);
        return offers.stream()
                .map(OfferDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get offers for a user
     */
    @Transactional(readOnly = true)
    public List<OfferDTO> getUserOffers(UUID userId) {
        List<Offer> offers = offerRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return offers.stream()
                .map(OfferDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a single offer by ID
     */
    @Transactional(readOnly = true)
    public OfferDTO getOfferById(UUID offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("Offer not found"));
        return OfferDTO.fromEntity(offer);
    }
    
    /**
     * Get offers for a lead
     */
    @Transactional(readOnly = true)
    public List<OfferDTO> getOffersByLeadId(UUID leadId) {
        List<Offer> offers = offerRepository.findByLeadIdOrderByCreatedAtDesc(leadId);
        return offers.stream()
                .map(OfferDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Create or update lead from offer
     * Ensures one lead per listing combination by reusing existing lead for the same thread
     */
    private Lead createOrUpdateLeadFromOffer(Offer offer, ChatThread thread) {
        // Always reuse the lead from thread if it exists (one lead per thread/listing combination)
        Lead existingLead = null;
        if (thread.getLeadId() != null) {
            existingLead = leadRepository.findById(thread.getLeadId()).orElse(null);
        }
        
        if (existingLead != null) {
            // Update existing lead - keep current status (don't change from OPEN/PENDING states)
            existingLead.setEventType(offer.getEventType());
            existingLead.setEventDate(offer.getEventDate());
            existingLead.setVenueAddress(offer.getVenueAddress());
            existingLead.setGuestCount(offer.getGuestCount());
            existingLead.setBudget(offer.getOfferedPrice().toString());
            existingLead.setMessage(offer.getMessage());
            // Only update to NEW if it's in a closed state (DECLINED, WITHDRAWN, CONVERTED)
            if (existingLead.getStatus() == Lead.LeadStatus.DECLINED || 
                existingLead.getStatus() == Lead.LeadStatus.WITHDRAWN || 
                existingLead.getStatus() == Lead.LeadStatus.CONVERTED) {
                existingLead.setStatus(Lead.LeadStatus.NEW);
            }
            Lead savedLead = leadRepository.save(existingLead);
            // Ensure thread has the lead ID
            if (thread.getLeadId() == null) {
                thread.setLeadId(savedLead.getId());
                chatThreadRepository.save(thread);
            }
            return savedLead;
        } else {
            // Create new lead - status is NEW (customer sends offer or books)
            UserProfile user = userProfileRepository.findById(offer.getUserId())
                    .orElse(null);
            
            Lead lead = new Lead();
            lead.setVendor(offer.getVendor());
            lead.setUserId(offer.getUserId());
            lead.setName(user != null && user.getFullName() != null ? user.getFullName() : "Customer");
            lead.setEmail(user != null && user.getEmail() != null ? user.getEmail() : "");
            lead.setPhone(user != null ? user.getPhone() : null);
            lead.setEventType(offer.getEventType());
            lead.setEventDate(offer.getEventDate());
            lead.setVenueAddress(offer.getVenueAddress());
            lead.setGuestCount(offer.getGuestCount());
            lead.setBudget(offer.getOfferedPrice().toString());
            lead.setMessage(offer.getMessage());
            lead.setStatus(Lead.LeadStatus.NEW);
            Lead savedLead = leadRepository.save(lead);
            
            // Link thread to this lead
            thread.setLeadId(savedLead.getId());
            chatThreadRepository.save(thread);
            
            return savedLead;
        }
    }
    
    /**
     * Create order from accepted offer
     */
    private Order createOrderFromOffer(Offer offer) {
        Listing listing = offer.getListing();
        UserProfile user = userProfileRepository.findById(offer.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        // Calculate amounts using the accepted offer price
        BigDecimal baseAmount = offer.getOfferedPrice();
        BigDecimal addOnsAmount = BigDecimal.ZERO;
        BigDecimal customizationsAmount = BigDecimal.ZERO;
        BigDecimal discountAmount = offer.getOriginalPrice().subtract(offer.getOfferedPrice());
        
        // Platform fee: 5% of subtotal
        BigDecimal subtotal = baseAmount.add(addOnsAmount).add(customizationsAmount).subtract(discountAmount);
        BigDecimal platformFee = subtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        
        // GST: 18% of subtotal
        BigDecimal gst = subtotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        
        BigDecimal totalAmount = subtotal.add(platformFee).add(gst);
        
        // Calculate token amount (25% of total)
        BigDecimal tokenAmount = totalAmount.multiply(new BigDecimal("0.25")).setScale(0, RoundingMode.HALF_UP);
        
        // Create order
        Order order = new Order();
        order.setUserId(offer.getUserId());
        order.setVendor(offer.getVendor());
        order.setListing(listing);
        order.setItemType(listing.getType());
        order.setEventType(offer.getEventType());
        order.setEventDate(offer.getEventDate());
        order.setEventTime(offer.getEventTime());
        order.setVenueAddress(offer.getVenueAddress());
        order.setGuestCount(offer.getGuestCount());
        order.setBaseAmount(baseAmount);
        order.setAddOnsAmount(addOnsAmount);
        order.setCustomizationsAmount(customizationsAmount);
        order.setDiscountAmount(discountAmount);
        order.setTaxAmount(gst);
        order.setTotalAmount(totalAmount);
        order.setTokenAmount(tokenAmount);
        order.setBalanceAmount(totalAmount); // Full amount as balance initially
        order.setCustomerName(user.getFullName());
        order.setCustomerEmail(user.getEmail());
        order.setCustomerPhone(user.getPhone());
        order.setNotes("Order created from accepted offer. Original price: " + offer.getOriginalPrice() + ", Negotiated price: " + offer.getOfferedPrice());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setAwaitingTokenPayment(true); // Order awaits token payment
        
        order = orderRepository.save(order);
        
        // Create payment record (placeholder for token payment)
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUserId(offer.getUserId());
        payment.setVendor(offer.getVendor());
        payment.setAmount(totalAmount);
        payment.setPaymentMethod("pending"); // Will be set when user pays
        payment.setStatus(Payment.PaymentStatus.PENDING);
        paymentRepository.save(payment);
        
        // Create order timeline entry
        OrderTimeline timeline = new OrderTimeline();
        timeline.setOrder(order);
        timeline.setStage("Order Created from Offer - Awaiting Token Payment");
        timeline.setStatus(OrderTimeline.TimelineStatus.PENDING);
        orderTimelineRepository.save(timeline);
        
        return order;
    }
}

