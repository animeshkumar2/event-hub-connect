package com.eventhub.controller;

import com.eventhub.dto.ChatMessageDTO;
import com.eventhub.model.Message;
import com.eventhub.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle incoming chat messages via WebSocket
     * Client sends to: /app/chat.send
     * Message is broadcasted to: /topic/chat/{threadId}
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageDTO.SendRequest request) {
        log.info("Received WebSocket message: threadId={}, senderId={}, senderType={}", 
                request.getThreadId(), request.getSenderId(), request.getSenderType());
        
        try {
            // Determine sender type
            Message.SenderType senderType = "VENDOR".equalsIgnoreCase(request.getSenderType()) 
                    ? Message.SenderType.vendor 
                    : Message.SenderType.customer;
            
            // Save message to database
            Message savedMessage = chatService.sendMessage(
                    request.getThreadId(),
                    request.getSenderId(),
                    senderType,
                    request.getContent()
            );
            
            // Create response DTO
            ChatMessageDTO response = new ChatMessageDTO();
            response.setId(savedMessage.getId());
            response.setThreadId(request.getThreadId());
            response.setSenderId(savedMessage.getSenderId());
            response.setSenderType(savedMessage.getSenderType().name());
            response.setContent(savedMessage.getContent());
            response.setCreatedAt(savedMessage.getCreatedAt());
            response.setRead(savedMessage.getIsRead());
            
            // Broadcast to all subscribers of this thread
            String destination = "/topic/chat/" + request.getThreadId();
            messagingTemplate.convertAndSend(destination, response);
            
            log.info("Message broadcasted to {}", destination);
            
        } catch (Exception e) {
            log.error("Error processing chat message: {}", e.getMessage(), e);
            // Optionally send error back to sender
        }
    }
    
    /**
     * Handle typing indicator
     * Client sends to: /app/chat.typing
     * Broadcasted to: /topic/chat/{threadId}/typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingIndicator indicator) {
        String destination = "/topic/chat/" + indicator.getThreadId() + "/typing";
        messagingTemplate.convertAndSend(destination, indicator);
    }
    
    /**
     * Handle read receipt
     * Client sends to: /app/chat.read
     */
    @MessageMapping("/chat.read")
    public void handleReadReceipt(@Payload ReadReceipt receipt) {
        try {
            chatService.markThreadAsRead(receipt.getThreadId(), receipt.getUserId(), receipt.isVendor());
            
            // Notify the other party that messages were read
            String destination = "/topic/chat/" + receipt.getThreadId() + "/read";
            messagingTemplate.convertAndSend(destination, receipt);
        } catch (Exception e) {
            log.error("Error marking thread as read: {}", e.getMessage());
        }
    }
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class TypingIndicator {
        private UUID threadId;
        private UUID userId;
        private String userType; // "VENDOR" or "CUSTOMER"
        private boolean isTyping;
    }
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ReadReceipt {
        private UUID threadId;
        private UUID userId;
        private boolean isVendor;
    }
}

