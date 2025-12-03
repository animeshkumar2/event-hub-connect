package com.eventhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingDTO {
    private UUID id;
    private UUID vendorId;
    private String vendorName;
    private String type; // 'package' or 'item'
    private String name;
    private String description;
    private BigDecimal price;
    private String categoryId;
    private String categoryName;
    private List<String> images;
    private List<String> includedItemsText;
    private List<String> excludedItemsText;
    private String deliveryTime;
    private List<String> extraCharges;
    private String unit;
    private Integer minimumQuantity;
    private List<Integer> eventTypeIds;
    private Boolean isPopular;
    private Boolean isTrending;
}

