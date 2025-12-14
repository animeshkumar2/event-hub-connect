package com.eventhub.repository;

import com.eventhub.model.Lead;
import com.eventhub.model.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {
    Page<Lead> findByVendor(Vendor vendor, Pageable pageable);
    
    Page<Lead> findByVendorAndStatus(Vendor vendor, Lead.LeadStatus status, Pageable pageable);
    
    List<Lead> findByUserId(UUID userId);
    
    List<Lead> findByVendorAndStatus(Vendor vendor, Lead.LeadStatus status);
    
    @Query("SELECT COUNT(l) FROM Lead l WHERE l.createdAt >= :date")
    long countByCreatedAtAfter(@Param("date") LocalDateTime date);
    
    @Query("SELECT COUNT(l) FROM Lead l WHERE l.vendor.id = :vendorId")
    long countByVendorId(@Param("vendorId") UUID vendorId);
    
    @Query("SELECT COUNT(l) FROM Lead l WHERE l.vendor.id = :vendorId AND l.createdAt >= :date")
    long countByVendorIdAndCreatedAtAfter(@Param("vendorId") UUID vendorId, @Param("date") LocalDateTime date);
}





