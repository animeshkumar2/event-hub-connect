package com.eventhub.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_threads")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatThread {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId; // Customer ID
    
    // Relationship to get customer details
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnore
    private UserProfile user;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;
    
    @Column(name = "order_id")
    private UUID orderId; // Optional reference to order
    
    @Column(name = "lead_id")
    private UUID leadId; // Optional reference to lead
    
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;
    
    @Column(name = "is_read_by_vendor")
    private Boolean isReadByVendor = false;
    
    @Column(name = "is_read_by_user")
    private Boolean isReadByUser = false;
    
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
    
    // Helper method to get customer name
    public String getCustomerName() {
        if (user != null && user.getFullName() != null) {
            return user.getFullName();
        }
        return "Customer";
    }
    
    // Helper method to get customer email
    public String getCustomerEmail() {
        return user != null ? user.getEmail() : null;
    }
}
