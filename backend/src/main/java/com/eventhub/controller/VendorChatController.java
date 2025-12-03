package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.ChatThread;
import com.eventhub.model.Message;
import com.eventhub.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/chat")
@RequiredArgsConstructor
public class VendorChatController {
    
    private final ChatService chatService;
    
    @GetMapping("/threads")
    public ResponseEntity<ApiResponse<List<ChatThread>>> getThreads(@RequestHeader("X-Vendor-Id") UUID vendorId) {
        List<ChatThread> threads = chatService.getVendorThreads(vendorId);
        return ResponseEntity.ok(ApiResponse.success(threads));
    }
    
    @GetMapping("/threads/{threadId}/messages")
    public ResponseEntity<ApiResponse<Page<Message>>> getMessages(
            @PathVariable UUID threadId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = chatService.getMessages(threadId, pageable);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }
    
    @PostMapping("/threads/{threadId}/messages")
    public ResponseEntity<ApiResponse<Message>> sendMessage(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID threadId,
            @RequestBody SendMessageRequest request) {
        Message message = chatService.sendMessage(threadId, vendorId, Message.SenderType.VENDOR, request.getContent());
        return ResponseEntity.ok(ApiResponse.success("Message sent", message));
    }
    
    @PutMapping("/threads/{threadId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @PathVariable UUID threadId) {
        chatService.markThreadAsRead(threadId, vendorId, true);
        return ResponseEntity.ok(ApiResponse.success("Thread marked as read", null));
    }
    
    @lombok.Data
    public static class SendMessageRequest {
        private String content;
    }
}

