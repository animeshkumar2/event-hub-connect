package com.eventhub.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class EventRecommendationDTO {
    private String category;
    private String categoryName;
    private BigDecimal allocatedBudget;
    private List<ListingOption> options; // 3 best options per category
    
    @Data
    public static class ListingOption {
        private UUID vendorId;
        private String vendorName;
        private BigDecimal vendorRating;
        private Integer vendorReviewCount;
        private UUID packageId;
        private String packageName;
        private String packageDescription;
        private BigDecimal price;
        private String reason;
        private List<String> images;
        private Boolean isPopular;
        private Boolean isTrending;
        private BigDecimal valueScore; // Calculated score for ranking
    }
}
