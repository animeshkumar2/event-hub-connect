package com.eventhub.repository;

import com.eventhub.model.Lead;
import com.eventhub.model.Order;
import com.eventhub.model.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {
    Page<Lead> findByVendor(Vendor vendor, Pageable pageable);
    
    Page<Lead> findByVendorAndStatus(Vendor vendor, Lead.LeadStatus status, Pageable pageable);
    
    List<Lead> findByUserId(UUID userId);
    
    List<Lead> findByVendorAndStatus(Vendor vendor, Lead.LeadStatus status);
    
    // Find lead by order
    Optional<Lead> findByOrder(Order order);
    
    // Find lead by order ID
    @Query("SELECT l FROM Lead l WHERE l.order.id = :orderId")
    Optional<Lead> findByOrderId(@Param("orderId") UUID orderId);
    
    // Find leads by source
    List<Lead> findBySource(Lead.LeadSource source);
    
    // Find leads by vendor and source
    List<Lead> findByVendorAndSource(Vendor vendor, Lead.LeadSource source);
    
    @Query("SELECT COUNT(l) FROM Lead l WHERE l.createdAt >= :date")
    long countByCreatedAtAfter(@Param("date") LocalDateTime date);
    
    @Query("SELECT COUNT(l) FROM Lead l WHERE l.vendor.id = :vendorId")
    long countByVendorId(@Param("vendorId") UUID vendorId);
    
    @Query("SELECT COUNT(l) FROM Lead l WHERE l.vendor.id = :vendorId AND l.createdAt >= :date")
    long countByVendorIdAndCreatedAtAfter(@Param("vendorId") UUID vendorId, @Param("date") LocalDateTime date);
    
    // Optimized count query for leads by vendor and status
    @Query("SELECT COUNT(l) FROM Lead l WHERE l.vendor.id = :vendorId AND l.status = :status")
    long countByVendorIdAndStatus(@Param("vendorId") UUID vendorId, @Param("status") Lead.LeadStatus status);
    
    // Optimized query for vendor leads - only select needed fields, no JOIN FETCH
    @Query("SELECT l FROM Lead l " +
           "WHERE l.vendor.id = :vendorId " +
           "ORDER BY l.createdAt DESC")
    List<Lead> findByVendorIdOptimized(@Param("vendorId") UUID vendorId, Pageable pageable);
    
    // Optimized query for vendor leads with status filter
    @Query("SELECT l FROM Lead l " +
           "WHERE l.vendor.id = :vendorId AND l.status = :status " +
           "ORDER BY l.createdAt DESC")
    List<Lead> findByVendorIdAndStatusOptimized(
        @Param("vendorId") UUID vendorId, 
        @Param("status") Lead.LeadStatus status, 
        Pageable pageable
    );
}











