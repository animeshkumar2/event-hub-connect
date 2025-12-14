package com.eventhub.dto.response;

import lombok.Data;

@Data
public class StatsDTO {
    private Long totalVendors; // Verified vendors only
    private Long vendorCount; // All vendors (for spots calculation)
    private Long totalEventsCompleted;
    private Double averageRating;
    private Double satisfactionRate;
}


