package com.eventhub.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "availability_slots", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"vendor_id", "date", "time_slot", "category_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySlot {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    @JsonIgnore
    private Vendor vendor;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "time_slot", nullable = false, length = 10)
    private String timeSlot; // HH:MM format or slot type
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SlotStatus status = SlotStatus.AVAILABLE;
    
    // Category-specific availability (null means all categories)
    @Column(name = "category_id", length = 50)
    private String categoryId;
    
    // Link to specific listing (optional)
    @Column(name = "listing_id")
    private UUID listingId;
    
    // Time slot type for predefined slots
    @Enumerated(EnumType.STRING)
    @Column(name = "time_slot_type", length = 20)
    private TimeSlotType timeSlotType = TimeSlotType.FULL_DAY;
    
    // Link to order when booked
    @Column(name = "order_id")
    private UUID orderId;
    
    // Vendor notes for blocked dates
    @Column(name = "notes")
    private String notes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum SlotStatus {
        AVAILABLE, BOOKED, BUSY, BLOCKED
    }
    
    public enum TimeSlotType {
        MORNING,    // 6AM - 12PM
        AFTERNOON,  // 12PM - 5PM
        EVENING,    // 5PM - 11PM
        FULL_DAY    // Entire day
    }
}

