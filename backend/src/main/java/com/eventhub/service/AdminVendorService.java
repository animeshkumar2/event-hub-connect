package com.eventhub.service;

import com.eventhub.dto.response.VendorDetailDTO;
import com.eventhub.exception.NotFoundException;
import com.eventhub.model.*;
import com.eventhub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminVendorService {
    
    private final VendorRepository vendorRepository;
    private final ListingRepository listingRepository;
    private final ReviewRepository reviewRepository;
    private final LeadRepository leadRepository;
    private final OrderRepository orderRepository;
    private final VendorFAQRepository vendorFAQRepository;
    private final VendorPastEventRepository vendorPastEventRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final UserProfileRepository userProfileRepository;
    
    @Cacheable(value = "vendorDetails", key = "#vendorId")
    public VendorDetailDTO getVendorDetails(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        VendorDetailDTO dto = new VendorDetailDTO();
        
        // Basic Info
        dto.setId(vendor.getId());
        dto.setUserId(vendor.getUserId());
        dto.setBusinessName(vendor.getBusinessName());
        dto.setCategoryId(vendor.getVendorCategory() != null ? vendor.getVendorCategory().getId() : null);
        dto.setCategoryName(vendor.getVendorCategory() != null ? vendor.getVendorCategory().getName() : null);
        dto.setCustomCategoryName(vendor.getCustomCategoryName());
        dto.setCityId(vendor.getCity() != null ? String.valueOf(vendor.getCity().getId()) : null);
        dto.setCityName(vendor.getCityName());
        dto.setBio(vendor.getBio());
        dto.setRating(vendor.getRating());
        dto.setReviewCount(vendor.getReviewCount());
        dto.setStartingPrice(vendor.getStartingPrice());
        dto.setCoverImage(vendor.getCoverImage());
        dto.setPortfolioImages(vendor.getPortfolioImages());
        dto.setCoverageRadius(vendor.getCoverageRadius());
        dto.setIsVerified(vendor.getIsVerified());
        dto.setIsActive(vendor.getIsActive());
        dto.setCreatedAt(vendor.getCreatedAt());
        dto.setUpdatedAt(vendor.getUpdatedAt());
        
        // User Info
        if (vendor.getUserId() != null) {
            userProfileRepository.findById(vendor.getUserId()).ifPresent(user -> {
                dto.setUserEmail(user.getEmail());
                dto.setUserFullName(user.getFullName());
                dto.setUserPhone(user.getPhone());
            });
        }
        
        // Statistics - optimized queries (no entity loading, direct counts)
        dto.setTotalListings(listingRepository.countByVendorIdAndIsActiveTrue(vendorId));
        dto.setActiveListings(listingRepository.countByVendorIdAndIsActiveTrue(vendorId));
        
        // Use direct count queries instead of loading all entities
        dto.setTotalOrders(orderRepository.countByVendorId(vendorId));
        dto.setCompletedOrders(orderRepository.countByVendorIdAndStatus(vendorId, Order.OrderStatus.COMPLETED));
        dto.setPendingOrders(orderRepository.countByVendorIdAndStatus(vendorId, Order.OrderStatus.PENDING));
        
        // Use direct count queries
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        dto.setTotalLeads(leadRepository.countByVendorId(vendorId));
        dto.setNewLeads(leadRepository.countByVendorIdAndCreatedAtAfter(vendorId, thirtyDaysAgo));
        
        dto.setTotalReviews(reviewRepository.countByVendorId(vendorId));
        
        // Revenue calculations - use direct SQL aggregation
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenueByVendor(vendorId);
        dto.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        BigDecimal monthlyRevenue = orderRepository.calculateRevenueByVendorSince(vendorId, thirtyDaysAgo);
        dto.setMonthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO);
        
        // Related Data - use pagination and limit to avoid loading too much
        // Only load what's needed for display (lazy loading approach)
        List<Listing> listings = listingRepository.findByVendorIdOptimized(vendorId);
        dto.setListings(listings.stream()
            .limit(20) // Reduced from 50 to 20 for faster loading
            .map(this::mapToListingSummary)
            .collect(Collectors.toList()));
        
        // Load reviews with pagination
        Page<Review> reviewsPage = reviewRepository.findByVendorAndIsVisibleTrue(
            vendor, PageRequest.of(0, 20));
        List<Review> reviews = reviewsPage.getContent();
        
        // Batch load user names to avoid N+1 queries
        List<UUID> userIds = reviews.stream()
            .map(Review::getUserId)
            .distinct()
            .collect(Collectors.toList());
        Map<UUID, String> userNameMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            userProfileRepository.findAllById(userIds).forEach(user -> {
                userNameMap.put(user.getId(), user.getFullName());
            });
        }
        
        final Map<UUID, String> finalUserNameMap = userNameMap;
        dto.setReviews(reviews.stream()
            .map(r -> {
                VendorDetailDTO.ReviewSummaryDTO reviewDto = mapToReviewSummary(r);
                reviewDto.setUserName(finalUserNameMap.get(r.getUserId()));
                return reviewDto;
            })
            .collect(Collectors.toList()));
        
        Page<Lead> recentLeadsPage = leadRepository.findByVendor(vendor, PageRequest.of(0, 20)); // Reduced from 30
        dto.setLeads(recentLeadsPage.getContent().stream()
            .map(this::mapToLeadSummary)
            .collect(Collectors.toList()));
        
        Page<Order> ordersPage = orderRepository.findByVendor(vendor, PageRequest.of(0, 20));
        dto.setOrders(ordersPage.getContent().stream()
            .map(this::mapToOrderSummary)
            .collect(Collectors.toList()));
        
        List<VendorFAQ> faqs = vendorFAQRepository.findByVendorOrderByDisplayOrderAsc(vendor);
        dto.setFaqs(faqs.stream()
            .limit(10) // Limit FAQs to 10
            .map(this::mapToFAQSummary)
            .collect(Collectors.toList()));
        
        List<VendorPastEvent> pastEvents = vendorPastEventRepository.findByVendorOrderByEventDateDesc(vendor);
        dto.setPastEvents(pastEvents.stream()
            .limit(10) // Reduced from 20 to 10
            .map(this::mapToPastEventSummary)
            .collect(Collectors.toList()));
        
        // Availability slots - get next 7 days only (reduced from 30)
        List<AvailabilitySlot> slots = availabilitySlotRepository.findByVendorAndDateBetween(
            vendor, 
            java.time.LocalDate.now(), 
            java.time.LocalDate.now().plusDays(7)
        );
        dto.setAvailabilitySlots(slots.stream()
            .limit(50) // Limit to 50 slots
            .map(this::mapToAvailabilitySummary)
            .collect(Collectors.toList()));
        
        return dto;
    }
    
    @CacheEvict(value = "vendorDetails", key = "#vendorId")
    public void evictVendorCache(UUID vendorId) {
        // Cache eviction handled by annotation
    }
    
    private VendorDetailDTO.ListingSummaryDTO mapToListingSummary(Listing listing) {
        VendorDetailDTO.ListingSummaryDTO dto = new VendorDetailDTO.ListingSummaryDTO();
        dto.setId(listing.getId());
        dto.setName(listing.getName());
        dto.setType(listing.getType() != null ? listing.getType().name() : null);
        dto.setPrice(listing.getPrice());
        dto.setIsActive(listing.getIsActive());
        dto.setCreatedAt(listing.getCreatedAt());
        return dto;
    }
    
    private VendorDetailDTO.ReviewSummaryDTO mapToReviewSummary(Review review) {
        VendorDetailDTO.ReviewSummaryDTO dto = new VendorDetailDTO.ReviewSummaryDTO();
        dto.setId(review.getId());
        dto.setUserId(review.getUserId());
        // User name will be set by caller using batch-loaded map
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setIsVerified(review.getIsVerified());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
    
    private VendorDetailDTO.LeadSummaryDTO mapToLeadSummary(Lead lead) {
        VendorDetailDTO.LeadSummaryDTO dto = new VendorDetailDTO.LeadSummaryDTO();
        dto.setId(lead.getId());
        dto.setName(lead.getName());
        dto.setEmail(lead.getEmail());
        dto.setPhone(lead.getPhone());
        dto.setStatus(lead.getStatus() != null ? lead.getStatus().name() : null);
        dto.setEventType(lead.getEventType());
        dto.setCreatedAt(lead.getCreatedAt());
        return dto;
    }
    
    private VendorDetailDTO.OrderSummaryDTO mapToOrderSummary(Order order) {
        VendorDetailDTO.OrderSummaryDTO dto = new VendorDetailDTO.OrderSummaryDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setStatus(order.getStatus() != null ? order.getStatus().name() : null);
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }
    
    private VendorDetailDTO.FAQSummaryDTO mapToFAQSummary(VendorFAQ faq) {
        VendorDetailDTO.FAQSummaryDTO dto = new VendorDetailDTO.FAQSummaryDTO();
        dto.setId(faq.getId());
        dto.setQuestion(faq.getQuestion());
        dto.setAnswer(faq.getAnswer());
        dto.setDisplayOrder(faq.getDisplayOrder());
        return dto;
    }
    
    private VendorDetailDTO.PastEventSummaryDTO mapToPastEventSummary(VendorPastEvent event) {
        VendorDetailDTO.PastEventSummaryDTO dto = new VendorDetailDTO.PastEventSummaryDTO();
        dto.setId(event.getId());
        dto.setImage(event.getImage());
        dto.setEventType(event.getEventType());
        dto.setEventDate(event.getEventDate() != null ? 
            event.getEventDate().atStartOfDay() : null);
        return dto;
    }
    
    private VendorDetailDTO.AvailabilitySummaryDTO mapToAvailabilitySummary(AvailabilitySlot slot) {
        VendorDetailDTO.AvailabilitySummaryDTO dto = new VendorDetailDTO.AvailabilitySummaryDTO();
        dto.setId(slot.getId());
        dto.setDate(slot.getDate() != null ? slot.getDate().atStartOfDay() : null);
        dto.setTimeSlot(slot.getTimeSlot());
        dto.setStatus(slot.getStatus() != null ? slot.getStatus().name() : null);
        return dto;
    }
}

