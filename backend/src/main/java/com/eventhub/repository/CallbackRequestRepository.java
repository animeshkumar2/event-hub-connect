package com.eventhub.repository;

import com.eventhub.model.CallbackRequest;
import com.eventhub.model.CallbackRequest.CallbackStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CallbackRequestRepository extends JpaRepository<CallbackRequest, UUID> {
    
    // Find by status
    List<CallbackRequest> findByStatusOrderByCreatedAtDesc(CallbackStatus status);
    
    // Find pending callbacks
    List<CallbackRequest> findByStatusInOrderByCreatedAtAsc(List<CallbackStatus> statuses);
    
    // Find by vendor
    List<CallbackRequest> findByVendorIdOrderByCreatedAtDesc(UUID vendorId);
    
    // Find by mobile (to check duplicates)
    List<CallbackRequest> findByMobileAndCreatedAtAfter(String mobile, LocalDateTime after);
    
    // Paginated list for admin
    Page<CallbackRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // Count pending
    long countByStatus(CallbackStatus status);
    
    // Find recent by mobile (prevent spam)
    @Query("SELECT COUNT(c) FROM CallbackRequest c WHERE c.mobile = :mobile AND c.createdAt > :since")
    long countRecentByMobile(String mobile, LocalDateTime since);
}
