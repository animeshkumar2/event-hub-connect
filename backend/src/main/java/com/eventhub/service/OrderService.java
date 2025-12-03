package com.eventhub.service;

import com.eventhub.model.*;
import com.eventhub.repository.*;
import com.eventhub.exception.NotFoundException;
import com.eventhub.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ListingRepository listingRepository;
    private final VendorRepository vendorRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final PaymentRepository paymentRepository;
    private final OrderTimelineRepository orderTimelineRepository;
    private final OrderAddOnRepository orderAddOnRepository;
    private final AddOnRepository addOnRepository;
    
    /**
     * Create order from cart
     */
    public Order createOrderFromCart(UUID userId, CreateOrderRequest request) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        
        if (cartItems.isEmpty()) {
            throw new BusinessRuleException("Cart is empty");
        }
        
        // Create order for each cart item (multi-vendor support)
        Order order = null;
        for (CartItem cartItem : cartItems) {
            order = createOrderFromCartItem(userId, cartItem, request);
        }
        
        // Clear cart after order creation
        cartItemRepository.deleteByUserId(userId);
        
        return order;
    }
    
    private Order createOrderFromCartItem(UUID userId, CartItem cartItem, CreateOrderRequest request) {
        Listing listing = cartItem.getListing();
        Vendor vendor = cartItem.getVendor();
        
        // Validate listing still exists and is active
        if (!listing.getIsActive()) {
            throw new BusinessRuleException("Listing is no longer available");
        }
        
        // Check availability if date/time provided
        if (request.getEventDate() != null && request.getEventTime() != null) {
            AvailabilitySlot slot = availabilitySlotRepository
                    .findByVendorAndDateAndTimeSlot(vendor, request.getEventDate(), request.getEventTime())
                    .orElseThrow(() -> new BusinessRuleException("Selected time slot is not available"));
            
            if (slot.getStatus() != AvailabilitySlot.SlotStatus.AVAILABLE) {
                throw new BusinessRuleException("Selected time slot is not available");
            }
            
            // Mark slot as booked
            slot.setStatus(AvailabilitySlot.SlotStatus.BOOKED);
            availabilitySlotRepository.save(slot);
        }
        
        // Calculate amounts
        BigDecimal baseAmount = cartItem.getBasePrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        BigDecimal addOnsAmount = BigDecimal.ZERO; // Calculate from cart item add-ons
        BigDecimal customizationsAmount = BigDecimal.ZERO; // From customizations
        BigDecimal discountAmount = BigDecimal.ZERO;
        
        // Platform fee: 5% of subtotal
        BigDecimal subtotal = baseAmount.add(addOnsAmount).add(customizationsAmount).subtract(discountAmount);
        BigDecimal platformFee = subtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        
        // GST: 18% of subtotal
        BigDecimal gst = subtotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        
        BigDecimal totalAmount = subtotal.add(platformFee).add(gst);
        
        // Create order
        Order order = new Order();
        order.setUserId(userId);
        order.setVendor(vendor);
        order.setListing(listing);
        order.setItemType(listing.getType());
        order.setEventType(request.getEventType());
        order.setEventDate(request.getEventDate());
        order.setEventTime(request.getEventTime());
        order.setVenueAddress(request.getVenueAddress());
        order.setGuestCount(request.getGuestCount());
        order.setBaseAmount(baseAmount);
        order.setAddOnsAmount(addOnsAmount);
        order.setCustomizationsAmount(customizationsAmount);
        order.setDiscountAmount(discountAmount);
        order.setTaxAmount(gst);
        order.setTotalAmount(totalAmount);
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setNotes(request.getNotes());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        
        order = orderRepository.save(order);
        
        // Create payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUserId(userId);
        payment.setVendor(vendor);
        payment.setAmount(totalAmount);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        paymentRepository.save(payment);
        
        // Create order timeline entry
        OrderTimeline timeline = new OrderTimeline();
        timeline.setOrder(order);
        timeline.setStage("Order Created");
        timeline.setStatus(OrderTimeline.TimelineStatus.PENDING);
        orderTimelineRepository.save(timeline);
        
        return order;
    }
    
    @Transactional(readOnly = true)
    public List<Order> getCustomerOrders(UUID userId) {
        return orderRepository.findByUserId(userId, org.springframework.data.domain.Pageable.unpaged()).getContent();
    }
    
    @Transactional(readOnly = true)
    public Order getOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
    }
    
    public Order updateOrderStatus(UUID orderId, Order.OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        
        // Update timeline
        OrderTimeline timeline = new OrderTimeline();
        timeline.setOrder(order);
        timeline.setStage("Status Updated: " + status);
        timeline.setStatus(OrderTimeline.TimelineStatus.COMPLETED);
        timeline.setCompletedAt(java.time.LocalDateTime.now());
        orderTimelineRepository.save(timeline);
        
        return orderRepository.save(order);
    }
    
    // Inner class for request
    @lombok.Data
    public static class CreateOrderRequest {
        private String paymentMethod;
        private String customerName;
        private String customerEmail;
        private String customerPhone;
        private LocalDate eventDate;
        private String eventTime;
        private String venueAddress;
        private Integer guestCount;
        private String eventType;
        private String notes;
    }
}

