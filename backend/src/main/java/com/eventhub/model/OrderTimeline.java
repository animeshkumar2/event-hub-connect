package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_timeline")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderTimeline {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @Column(nullable = false, length = 50)
    private String stage; // e.g., "Lead Received", "Token Paid", "Booking Confirmed"
    
    @Convert(converter = TimelineStatusConverter.class)
    @Column(nullable = false, length = 20)
    private TimelineStatus status = TimelineStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum TimelineStatus {
        PENDING, COMPLETED, CANCELLED
    }
}

