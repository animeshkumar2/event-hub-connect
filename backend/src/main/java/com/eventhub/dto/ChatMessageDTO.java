package com.eventhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private UUID id;
    private UUID threadId;
    private UUID senderId;
    private String senderType; // "VENDOR" or "CUSTOMER"
    private String content;
    private LocalDateTime createdAt;
    private boolean isRead;
    
    // For incoming messages
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendRequest {
        private UUID threadId;
        private UUID senderId;
        private String senderType;
        private String content;
    }
}




