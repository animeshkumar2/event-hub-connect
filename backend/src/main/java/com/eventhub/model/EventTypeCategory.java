package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_type_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(EventTypeCategoryId.class)
public class EventTypeCategory {
    @Id
    @Column(name = "event_type_id", nullable = false)
    private Integer eventTypeId;
    
    @Id
    @Column(name = "category_id", nullable = false, length = 50)
    private String categoryId;
    
    @ManyToOne
    @JoinColumn(name = "event_type_id", insertable = false, updatable = false)
    private EventType eventType;
    
    @ManyToOne
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

