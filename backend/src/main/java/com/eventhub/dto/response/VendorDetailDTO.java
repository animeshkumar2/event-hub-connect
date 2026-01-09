package com.eventhub.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class VendorDetailDTO {
    // Basic Info
    private UUID id;
    private UUID userId;
    private String businessName;
    private String categoryId;
    private String categoryName;
    private String customCategoryName;
    private String cityId;
    private String cityName;
    private String bio;
    private BigDecimal rating;
    private Integer reviewCount;
    private BigDecimal startingPrice;
    private String coverImage;
    private List<String> portfolioImages;
    private Integer coverageRadius;
    private Boolean isVerified;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // User Info
    private String userEmail;
    private String userFullName;
    private String userPhone;
    
    // Statistics
    private Long totalListings;
    private Long activeListings;
    private Long totalOrders;
    private Long completedOrders;
    private Long pendingOrders;
    private Long totalLeads;
    private Long newLeads;
    private Long totalReviews;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    
    // Related Data
    private List<ListingSummaryDTO> listings;
    private List<ReviewSummaryDTO> reviews;
    private List<LeadSummaryDTO> leads;
    private List<OrderSummaryDTO> orders;
    private List<FAQSummaryDTO> faqs;
    private List<PastEventSummaryDTO> pastEvents;
    private List<AvailabilitySummaryDTO> availabilitySlots;
    
    @Data
    public static class ListingSummaryDTO {
        private UUID id;
        private String name;
        private String type; // package or item
        private BigDecimal price;
        private Boolean isActive;
        private LocalDateTime createdAt;
    }
    
    @Data
    public static class ReviewSummaryDTO {
        private UUID id;
        private UUID userId;
        private String userName;
        private BigDecimal rating;
        private String comment;
        private Boolean isVerified;
        private LocalDateTime createdAt;
    }
    
    @Data
    public static class LeadSummaryDTO {
        private UUID id;
        private String name;
        private String email;
        private String phone;
        private String status;
        private String eventType;
        private LocalDateTime createdAt;
    }
    
    @Data
    public static class OrderSummaryDTO {
        private UUID id;
        private String orderNumber;
        private String status;
        private BigDecimal totalAmount;
        private LocalDateTime createdAt;
    }
    
    @Data
    public static class FAQSummaryDTO {
        private UUID id;
        private String question;
        private String answer;
        private Integer displayOrder;
    }
    
    @Data
    public static class PastEventSummaryDTO {
        private UUID id;
        private String image;
        private String eventType;
        private LocalDateTime eventDate;
    }
    
    @Data
    public static class AvailabilitySummaryDTO {
        private UUID id;
        private LocalDateTime date;
        private String timeSlot;
        private String status;
    }
}







