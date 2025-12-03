package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "leads")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lead {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;
    
    @Column(name = "user_id")
    private UUID userId; // Can be null for anonymous leads
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(nullable = false, length = 255)
    private String email;
    
    @Column(length = 20)
    private String phone;
    
    @Column(name = "event_type", length = 50)
    private String eventType;
    
    @Column(name = "event_date")
    private LocalDate eventDate;
    
    @Column(name = "venue_address", columnDefinition = "TEXT")
    private String venueAddress;
    
    @Column(name = "guest_count")
    private Integer guestCount;
    
    @Column(length = 100)
    private String budget; // e.g., "50,000 - 1,00,000"
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private LeadStatus status = LeadStatus.NEW;
    
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
    
    public enum LeadStatus {
        NEW, OPEN, QUOTED, ACCEPTED, DECLINED, CONVERTED
    }
}

