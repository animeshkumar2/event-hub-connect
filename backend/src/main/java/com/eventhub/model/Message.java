package com.eventhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "thread_id", nullable = false)
    private ChatThread thread;
    
    @Column(name = "sender_id", nullable = false)
    private UUID senderId; // User ID or Vendor ID
    
    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false, length = 20)
    private SenderType senderType; // 'customer' or 'vendor'
    
    @Column(name = "text", nullable = false, columnDefinition = "TEXT")
    private String content; // Maps to 'text' column in database
    
    @Column(name = "is_read")
    private Boolean isRead = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Use lowercase to match database CHECK constraint
    public enum SenderType {
        customer, vendor;
        
        // Helper methods for compatibility
        public static SenderType fromString(String type) {
            if (type == null) return customer;
            return type.equalsIgnoreCase("vendor") ? vendor : customer;
        }
        
        public boolean isVendor() {
            return this == vendor;
        }
        
        public boolean isCustomer() {
            return this == customer;
        }
    }
}
