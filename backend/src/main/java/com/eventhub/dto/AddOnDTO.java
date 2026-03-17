package com.eventhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddOnDTO {
    private UUID id;
    private String title;
    private String description;
    private BigDecimal price;
    private String category;
    private String imageUrl;
    private Integer maxQuantity;
    private Integer sortOrder;
}
