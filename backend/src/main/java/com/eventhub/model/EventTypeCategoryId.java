package com.eventhub.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventTypeCategoryId implements Serializable {
    private Integer eventTypeId;
    private String categoryId;
}

