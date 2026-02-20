package com.eventhub.service;

import com.eventhub.controller.PublicCallbackController.CallbackRequestDTO;
import com.eventhub.model.CallbackRequest;
import com.eventhub.model.CallbackRequest.CallbackStatus;
import com.eventhub.repository.CallbackRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CallbackRequestService {
    
    private final CallbackRequestRepository callbackRequestRepository;
    
    @Transactional
    public CallbackRequest createCallbackRequest(CallbackRequestDTO dto) {
        // Check for spam - max 3 requests per mobile per hour
        long recentCount = callbackRequestRepository.countRecentByMobile(
            dto.getMobile(), 
            LocalDateTime.now().minusHours(1)
        );
        
        if (recentCount >= 3) {
            throw new RuntimeException("Too many requests. Please try again later.");
        }
        
        CallbackRequest request = CallbackRequest.builder()
            .name(dto.getName())
            .mobile(dto.getMobile())
            .eventDate(dto.getEventDate())
            .dateFlexible(dto.getDateFlexible() != null ? dto.getDateFlexible() : false)
            .requirement(dto.getRequirement())
            .listingId(dto.getListingId())
            .listingName(dto.getListingName())
            .vendorId(dto.getVendorId() != null ? UUID.fromString(dto.getVendorId()) : null)
            .vendorName(dto.getVendorName())
            .category(dto.getCategory())
            .status(CallbackStatus.PENDING)
            .build();
        
        CallbackRequest saved = callbackRequestRepository.save(request);
        
        log.info("New callback request: {} - {} for vendor {}", 
            saved.getName(), saved.getMobile(), saved.getVendorName());
        
        // TODO: Send notification to admin (email/SMS/push)
        // TODO: Send confirmation SMS to customer
        
        return saved;
    }
    
    public List<CallbackRequest> getPendingCallbacks() {
        return callbackRequestRepository.findByStatusInOrderByCreatedAtAsc(
            List.of(CallbackStatus.PENDING, CallbackStatus.NOT_REACHABLE)
        );
    }
    
    public Page<CallbackRequest> getAllCallbacks(Pageable pageable) {
        return callbackRequestRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
    
    public List<CallbackRequest> getVendorCallbacks(UUID vendorId) {
        return callbackRequestRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
    }
    
    @Transactional
    public CallbackRequest updateStatus(UUID id, CallbackStatus status, String notes, String calledBy) {
        CallbackRequest request = callbackRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Callback request not found"));
        
        request.setStatus(status);
        request.setNotes(notes);
        
        if (status == CallbackStatus.CALLED || status == CallbackStatus.CONNECTED) {
            request.setCalledAt(LocalDateTime.now());
            request.setCalledBy(calledBy);
        }
        
        return callbackRequestRepository.save(request);
    }
    
    public long getPendingCount() {
        return callbackRequestRepository.countByStatus(CallbackStatus.PENDING);
    }
}
