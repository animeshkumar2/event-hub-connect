package com.eventhub.service;

import com.eventhub.model.Order;
import com.eventhub.model.ReviewRequest;
import com.eventhub.model.Vendor;
import com.eventhub.repository.OrderRepository;
import com.eventhub.repository.ReviewRepository;
import com.eventhub.repository.ReviewRequestRepository;
import com.eventhub.repository.VendorRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewRequestService {
    
    private final ReviewRequestRepository reviewRequestRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final VendorRepository vendorRepository;
    // private final EmailService emailService; // TODO: Inject when email service is ready
    
    // Configuration constants
    private static final int MAX_REQUESTS_PER_DAY = 3;
    private static final int COOLDOWN_DAYS = 7;
    private static final int MIN_DAYS_AFTER_EVENT = 2;
    private static final int MAX_DAYS_AFTER_EVENT = 30;
    private static final int MAX_REQUESTS_PER_CUSTOMER_PER_MONTH = 5;
    
    /**
     * Get eligible orders for review requests
     */
    public List<EligibleOrder> getEligibleOrders(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        // Get completed orders - using the correct method with OrderStatus enum
        Page<Order> completedOrdersPage = orderRepository.findByVendorAndStatus(
                vendor, 
                Order.OrderStatus.COMPLETED, 
                PageRequest.of(0, 100) // Get up to 100 recent completed orders
        );
        List<Order> completedOrders = completedOrdersPage.getContent();
        
        return completedOrders.stream()
                .map(order -> {
                    EligibilityCheck check = checkEligibility(vendor, order);
                    return new EligibleOrder(
                            order.getId(),
                            order.getCustomerName(),
                            order.getCustomerEmail(),
                            order.getEventType(),
                            order.getEventDate(),
                            order.getCreatedAt(),
                            check.isEligible(),
                            check.getReason(),
                            check.getRecommendation()
                    );
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Check if an order is eligible for review request
     */
    private EligibilityCheck checkEligibility(Vendor vendor, Order order) {
        // Check 1: Order must be completed
        if (order.getStatus() != Order.OrderStatus.COMPLETED) {
            return new EligibilityCheck(false, "Order not completed", null);
        }
        
        // Check 2: Event date must have passed
        if (order.getEventDate() == null) {
            return new EligibilityCheck(false, "Event date not set", null);
        }
        
        LocalDate eventDate = order.getEventDate();
        LocalDate today = LocalDate.now();
        long daysAfterEvent = ChronoUnit.DAYS.between(eventDate, today);
        
        if (daysAfterEvent < MIN_DAYS_AFTER_EVENT) {
            return new EligibilityCheck(false, 
                    String.format("Too soon (wait %d more days)", MIN_DAYS_AFTER_EVENT - daysAfterEvent), 
                    null);
        }
        
        if (daysAfterEvent > MAX_DAYS_AFTER_EVENT) {
            return new EligibilityCheck(false, "Too old to request", null);
        }
        
        // Check 3: Review doesn't already exist
        boolean reviewExists = reviewRepository.existsById(order.getId()); // Using existsById as fallback
        if (reviewExists) {
            return new EligibilityCheck(false, "Review already submitted", null);
        }
        
        // Check 4: Review request not already sent
        boolean requestExists = reviewRequestRepository.existsByOrderId(order.getId());
        if (requestExists) {
            ReviewRequest existingRequest = reviewRequestRepository.findByOrderId(order.getId()).orElse(null);
            if (existingRequest != null) {
                long daysSinceRequest = ChronoUnit.DAYS.between(
                        existingRequest.getRequestedAt().toLocalDate(), 
                        today
                );
                if (daysSinceRequest < COOLDOWN_DAYS) {
                    return new EligibilityCheck(false, 
                            String.format("Requested %d days ago (wait %d more days)", 
                                    daysSinceRequest, COOLDOWN_DAYS - daysSinceRequest), 
                            null);
                }
            }
        }
        
        // Check 5: Vendor hasn't exceeded daily limit
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long requestsToday = reviewRequestRepository.countByVendorIdAndRequestedAtAfter(vendor.getId(), startOfDay);
        if (requestsToday >= MAX_REQUESTS_PER_DAY) {
            return new EligibilityCheck(false, 
                    String.format("Daily limit reached (%d/%d)", requestsToday, MAX_REQUESTS_PER_DAY), 
                    null);
        }
        
        // Check 6: Customer hasn't received too many requests recently
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long customerRequests = reviewRequestRepository.countByCustomerIdAndRequestedAtAfter(
                order.getUserId(), thirtyDaysAgo);
        if (customerRequests >= MAX_REQUESTS_PER_CUSTOMER_PER_MONTH) {
            return new EligibilityCheck(false, "Customer received too many requests", null);
        }
        
        // Eligible! Provide recommendation
        String recommendation = daysAfterEvent >= 3 && daysAfterEvent <= 7 
                ? "Best time to ask" 
                : "Good time to ask";
        
        return new EligibilityCheck(true, "Eligible", recommendation);
    }
    
    /**
     * Send review request
     */
    @Transactional
    public ReviewRequestResult sendReviewRequest(UUID vendorId, UUID orderId) {
        // Get vendor and order
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Verify order belongs to vendor
        if (!order.getVendor().getId().equals(vendorId)) {
            throw new RuntimeException("Order does not belong to this vendor");
        }
        
        // Check eligibility
        EligibilityCheck check = checkEligibility(vendor, order);
        if (!check.isEligible()) {
            throw new RuntimeException("Order not eligible: " + check.getReason());
        }
        
        // Create review request record
        ReviewRequest reviewRequest = ReviewRequest.builder()
                .vendor(vendor)
                .order(order)
                .customerId(order.getUserId())
                .customerEmail(order.getCustomerEmail())
                .customerName(order.getCustomerName())
                .requestedAt(LocalDateTime.now())
                .emailSent(false)
                .build();
        
        reviewRequest = reviewRequestRepository.save(reviewRequest);
        
        // Send email (mock for now)
        try {
            sendReviewRequestEmail(vendor, order, reviewRequest);
            reviewRequest.setEmailSent(true);
            reviewRequestRepository.save(reviewRequest);
            log.info("Review request email sent to {} for order {}", order.getCustomerEmail(), orderId);
        } catch (Exception e) {
            log.error("Failed to send review request email", e);
            // Don't fail the request, just log the error
        }
        
        // Calculate next available request time
        LocalDateTime nextAvailable = reviewRequest.getRequestedAt().plusDays(COOLDOWN_DAYS);
        
        // Check remaining daily limit
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long requestsToday = reviewRequestRepository.countByVendorIdAndRequestedAtAfter(vendorId, startOfDay);
        int remainingToday = MAX_REQUESTS_PER_DAY - (int) requestsToday;
        
        return new ReviewRequestResult(
                reviewRequest.getId(),
                order.getCustomerName(),
                order.getCustomerEmail(),
                true,
                nextAvailable,
                remainingToday
        );
    }
    
    /**
     * Send review request email (mock implementation)
     */
    private void sendReviewRequestEmail(Vendor vendor, Order order, ReviewRequest reviewRequest) {
        // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
        String subject = String.format("Share your experience with %s", vendor.getBusinessName());
        String body = String.format("""
                Hi %s,
                
                Hope your %s was amazing! 🎉
                
                We'd love to hear about your experience with %s.
                Your feedback helps them improve and helps other customers make informed decisions.
                
                [Leave a Review Button]
                
                Takes just 2 minutes. Your honest feedback matters!
                
                Best regards,
                The cartevent Team
                
                ---
                Not interested? Unsubscribe from review requests
                """,
                order.getCustomerName(),
                order.getEventType(),
                vendor.getBusinessName()
        );
        
        log.info("MOCK EMAIL - To: {}, Subject: {}", order.getCustomerEmail(), subject);
        log.info("MOCK EMAIL - Body: {}", body);
        
        // When email service is ready:
        // emailService.send(order.getCustomerEmail(), subject, body);
    }
    
    // DTOs
    @Data
    @AllArgsConstructor
    public static class EligibleOrder {
        private UUID orderId;
        private String customerName;
        private String customerEmail;
        private String eventType;
        private LocalDate eventDate;
        private LocalDateTime orderDate;
        private boolean eligible;
        private String reason;
        private String recommendation;
    }
    
    @Data
    @AllArgsConstructor
    private static class EligibilityCheck {
        private boolean eligible;
        private String reason;
        private String recommendation;
    }
    
    @Data
    @AllArgsConstructor
    public static class ReviewRequestResult {
        private UUID requestId;
        private String customerName;
        private String customerEmail;
        private boolean canRequestAgain;
        private LocalDateTime nextRequestAvailableAt;
        private int remainingRequestsToday;
    }
}
