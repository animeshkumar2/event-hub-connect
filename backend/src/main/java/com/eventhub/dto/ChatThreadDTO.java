package com.eventhub.dto;

import com.eventhub.model.ChatThread;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatThreadDTO {
    private UUID id;
    private UUID userId;
    private String customerName;
    private String customerEmail;
    private String customerInitials;
    private UUID vendorId;
    private String vendorName;
    private UUID orderId;
    private UUID leadId;
    private LocalDateTime lastMessageAt;
    private Boolean isReadByVendor;
    private Boolean isReadByUser;
    private String lastMessagePreview;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static ChatThreadDTO fromEntity(ChatThread thread) {
        ChatThreadDTO dto = new ChatThreadDTO();
        dto.setId(thread.getId());
        dto.setUserId(thread.getUserId());
        dto.setCustomerName(thread.getCustomerName());
        dto.setCustomerEmail(thread.getCustomerEmail());
        dto.setCustomerInitials(getInitials(thread.getCustomerName()));
        
        if (thread.getVendor() != null) {
            dto.setVendorId(thread.getVendor().getId());
            dto.setVendorName(thread.getVendor().getBusinessName());
        }
        
        dto.setOrderId(thread.getOrderId());
        dto.setLeadId(thread.getLeadId());
        dto.setLastMessageAt(thread.getLastMessageAt());
        dto.setIsReadByVendor(thread.getIsReadByVendor());
        dto.setIsReadByUser(thread.getIsReadByUser());
        dto.setCreatedAt(thread.getCreatedAt());
        dto.setUpdatedAt(thread.getUpdatedAt());
        
        return dto;
    }
    
    private static String getInitials(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "C";
        }
        String[] parts = name.trim().split("\\s+");
        if (parts.length >= 2) {
            return (parts[0].charAt(0) + "" + parts[parts.length - 1].charAt(0)).toUpperCase();
        }
        return name.substring(0, Math.min(2, name.length())).toUpperCase();
    }
}








