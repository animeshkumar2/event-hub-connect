package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.ChatThreadDTO;
import com.eventhub.model.Message;
import com.eventhub.service.ChatService;
import com.eventhub.util.VendorIdResolver;
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
    private final VendorIdResolver vendorIdResolver;
    
    @GetMapping("/threads")
    public ResponseEntity<ApiResponse<List<ChatThreadDTO>>> getThreads(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        List<ChatThreadDTO> threads = chatService.getVendorThreadsWithDetails(vendorId);
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
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID threadId,
            @RequestBody SendMessageRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Message message = chatService.sendMessage(threadId, vendorId, Message.SenderType.vendor, request.getContent());
        return ResponseEntity.ok(ApiResponse.success("Message sent", message));
    }
    
    @PutMapping("/threads/{threadId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @PathVariable UUID threadId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        chatService.markThreadAsRead(threadId, vendorId, true);
        return ResponseEntity.ok(ApiResponse.success("Thread marked as read", null));
    }
    
    @lombok.Data
    public static class SendMessageRequest {
        private String content;
    }
}
