package com.eventhub.service;

import com.eventhub.dto.ChatThreadDTO;
import com.eventhub.model.ChatThread;
import com.eventhub.model.Message;
import com.eventhub.model.Vendor;
import com.eventhub.repository.ChatThreadRepository;
import com.eventhub.repository.MessageRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {
    
    private final ChatThreadRepository chatThreadRepository;
    private final MessageRepository messageRepository;
    private final VendorRepository vendorRepository;
    
    public ChatThread getOrCreateThread(UUID userId, UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        return chatThreadRepository.findByUserIdAndVendor(userId, vendor)
                .orElseGet(() -> {
                    ChatThread thread = new ChatThread();
                    thread.setUserId(userId);
                    thread.setVendor(vendor);
                    return chatThreadRepository.save(thread);
                });
    }
    
    public Message sendMessage(UUID threadId, UUID senderId, Message.SenderType senderType, String content) {
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new NotFoundException("Chat thread not found"));
        
        Message message = new Message();
        message.setThread(thread);
        message.setSenderId(senderId);
        message.setSenderType(senderType);
        message.setContent(content);
        message.setIsRead(false);
        
        // Update thread last message time
        thread.setLastMessageAt(java.time.LocalDateTime.now());
        if (senderType == Message.SenderType.customer) {
            thread.setIsReadByVendor(false);
        } else {
            thread.setIsReadByUser(false);
        }
        chatThreadRepository.save(thread);
        
        return messageRepository.save(message);
    }
    
    @Transactional(readOnly = true)
    public Page<Message> getMessages(UUID threadId, Pageable pageable) {
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new NotFoundException("Chat thread not found"));
        return messageRepository.findByThreadOrderByCreatedAtDesc(thread, pageable);
    }
    
    @Transactional(readOnly = true)
    public List<ChatThread> getCustomerThreads(UUID userId) {
        return chatThreadRepository.findByUserId(userId);
    }
    
    @Transactional(readOnly = true)
    public List<ChatThreadDTO> getVendorThreadsWithDetails(UUID vendorId) {
        // Use optimized query with pagination to limit results
        List<ChatThread> threads = chatThreadRepository.findByVendorIdOptimized(
            vendorId, PageRequest.of(0, 50)
        );
        
        return threads.stream().map(thread -> {
            ChatThreadDTO dto = ChatThreadDTO.fromEntity(thread);
            // Get last message preview
            Page<Message> lastMessages = messageRepository.findByThreadOrderByCreatedAtDesc(
                    thread, PageRequest.of(0, 1));
            if (!lastMessages.isEmpty()) {
                Message lastMessage = lastMessages.getContent().get(0);
                String preview = lastMessage.getContent();
                if (preview.length() > 50) {
                    preview = preview.substring(0, 47) + "...";
                }
                dto.setLastMessagePreview(preview);
            }
            return dto;
        }).collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ChatThread> getVendorThreads(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        return chatThreadRepository.findByVendor(vendor);
    }
    
    public void markThreadAsRead(UUID threadId, UUID userId, boolean isVendor) {
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new NotFoundException("Chat thread not found"));
        
        if (isVendor) {
            thread.setIsReadByVendor(true);
        } else {
            thread.setIsReadByUser(true);
        }
        chatThreadRepository.save(thread);
    }
}
