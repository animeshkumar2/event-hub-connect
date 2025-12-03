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
    @ManyToOne
    @JoinColumn(name = "event_type_id", nullable = false)
    private EventType eventType;
    
    @Id
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

