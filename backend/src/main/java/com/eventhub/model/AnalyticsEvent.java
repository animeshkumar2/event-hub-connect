package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "analytics_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "event_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private EventType eventType;
    
    @Column(name = "user_id")
    private UUID userId; // NULL for anonymous visitors
    
    @Column(name = "session_id", length = 255)
    private String sessionId;
    
    @Column(name = "page_path", length = 500)
    private String pagePath;
    
    @Column(length = 500)
    private String referrer;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(length = 100)
    private String country;
    
    @Column(length = 100)
    private String city;
    
    @Column(name = "device_type", length = 50)
    private String deviceType;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum EventType {
        PAGE_VIEW, SIGNUP, LOGIN, VENDOR_SIGNUP, CUSTOMER_SIGNUP
    }
}





