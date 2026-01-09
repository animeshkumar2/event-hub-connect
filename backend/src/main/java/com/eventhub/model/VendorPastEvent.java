package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "vendor_past_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorPastEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;
    
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = true)
    private Order order; // Reference to the order this event was completed from
    
    @ElementCollection
    @CollectionTable(name = "vendor_past_event_images", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> images; // Multiple images
    
    @Column(name = "event_type", length = 50)
    private String eventType;
    
    @Column(name = "event_date")
    private LocalDate eventDate;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // Event description/details
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
