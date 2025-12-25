package com.eventhub.repository;

import com.eventhub.model.ReviewRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRequestRepository extends JpaRepository<ReviewRequest, UUID> {
    
    // Check if review request already exists for an order
    boolean existsByOrderId(UUID orderId);
    
    Optional<ReviewRequest> findByOrderId(UUID orderId);
    
    // Count requests sent by vendor today
    @Query("SELECT COUNT(rr) FROM ReviewRequest rr WHERE rr.vendor.id = :vendorId AND rr.requestedAt >= :startOfDay")
    long countByVendorIdAndRequestedAtAfter(@Param("vendorId") UUID vendorId, @Param("startOfDay") LocalDateTime startOfDay);
    
    // Find last request to a customer from any vendor
    @Query("SELECT rr FROM ReviewRequest rr WHERE rr.customerId = :customerId ORDER BY rr.requestedAt DESC")
    List<ReviewRequest> findByCustomerIdOrderByRequestedAtDesc(@Param("customerId") UUID customerId);
    
    // Count requests to a customer in last N days
    @Query("SELECT COUNT(rr) FROM ReviewRequest rr WHERE rr.customerId = :customerId AND rr.requestedAt >= :since")
    long countByCustomerIdAndRequestedAtAfter(@Param("customerId") UUID customerId, @Param("since") LocalDateTime since);
    
    // Get all requests for a vendor
    List<ReviewRequest> findByVendorIdOrderByRequestedAtDesc(UUID vendorId);
}
