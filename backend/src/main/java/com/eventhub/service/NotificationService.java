package com.eventhub.service;

import com.eventhub.model.Lead;
import com.eventhub.model.Order;
import com.eventhub.model.Payment;
import com.eventhub.model.Vendor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    public void notifyVendorNewLead(Lead lead, Payment tokenPayment) {
        Vendor vendor = lead.getVendor();
        Order order = lead.getOrder();
        
        String message = String.format(
            "New Lead Received! Customer: %s, Event Type: %s, Event Date: %s, " +
            "Guest Count: %d, Token Amount Paid: %s, Total Order Value: %s",
            lead.getName(),
            lead.getEventType(),
            lead.getEventDate(),
            lead.getGuestCount() != null ? lead.getGuestCount() : 0,
            tokenPayment.getAmount(),
            order != null ? order.getTotalAmount() : "N/A"
        );
        
        log.info("NOTIFICATION to Vendor {} (ID: {}): {}", 
                vendor.getBusinessName(), vendor.getId(), message);
    }
    
    public void notifyUserLeadAccepted(Lead lead) {
        String message = String.format(
            "Your booking request has been accepted! Vendor: %s, Event Date: %s",
            lead.getVendor().getBusinessName(),
            lead.getEventDate()
        );
        
        log.info("NOTIFICATION to User {} ({}): {}", 
                lead.getName(), lead.getEmail(), message);
    }
    
    public void notifyUserLeadRejected(Lead lead, BigDecimal refundAmount) {
        String message = String.format(
            "Your booking request has been declined. Vendor: %s, Refund Amount: %s",
            lead.getVendor().getBusinessName(),
            refundAmount
        );
        
        log.info("NOTIFICATION to User {} ({}): {}", 
                lead.getName(), lead.getEmail(), message);
    }
    
    public void notifyVendorUpcomingEvent(Order order, int daysUntilEvent) {
        Vendor vendor = order.getVendor();
        
        String message = String.format(
            "Reminder: Upcoming Event in %d days! Customer: %s, Event Date: %s",
            daysUntilEvent,
            order.getCustomerName(),
            order.getEventDate()
        );
        
        log.info("NOTIFICATION to Vendor {} (ID: {}): {}", 
                vendor.getBusinessName(), vendor.getId(), message);
    }
    
    public void notifyUserUpcomingEvent(Order order, int daysUntilEvent) {
        String message = String.format(
            "Reminder: Your event is in %d days! Vendor: %s, Event Date: %s",
            daysUntilEvent,
            order.getVendor().getBusinessName(),
            order.getEventDate()
        );
        
        log.info("NOTIFICATION to User {} ({}): {}", 
                order.getCustomerName(), order.getCustomerEmail(), message);
    }
    
    public void notifyVendorCompleteEvent(Order order) {
        Vendor vendor = order.getVendor();
        
        String message = String.format(
            "Please mark your event as completed! Order: %s, Customer: %s",
            order.getOrderNumber(),
            order.getCustomerName()
        );
        
        log.info("NOTIFICATION to Vendor {} (ID: {}): {}", 
                vendor.getBusinessName(), vendor.getId(), message);
    }
    
    public void notifyUserPaymentSuccess(Payment payment) {
        Order order = payment.getOrder();
        
        String message = String.format(
            "Payment Successful! Amount: %s, Transaction ID: %s, Order: %s",
            payment.getAmount(),
            payment.getTransactionId(),
            order.getOrderNumber()
        );
        
        log.info("NOTIFICATION to User {} ({}): {}", 
                order.getCustomerName(), order.getCustomerEmail(), message);
    }
}
