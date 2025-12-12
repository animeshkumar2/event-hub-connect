package com.eventhub.dto.response;

import lombok.Data;

@Data
public class StatsDTO {
    private Long totalVendors;
    private Long totalEventsCompleted;
    private Double averageRating;
    private Double satisfactionRate;
}


