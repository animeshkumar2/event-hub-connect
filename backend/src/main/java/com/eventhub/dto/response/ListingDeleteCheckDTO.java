package com.eventhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingDeleteCheckDTO {
    private boolean canDelete;
    private boolean hasActiveOrders;
    private boolean isUsedInPackages;
    private int activeOrderCount;
    private int packageCount;
    private List<String> activeOrderNumbers;
    private List<String> packageNames;
    private String warningMessage;
    private String deleteType; // "HARD" or "SOFT"
}
