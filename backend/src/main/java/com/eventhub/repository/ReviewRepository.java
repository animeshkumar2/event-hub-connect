package com.eventhub.repository;

import com.eventhub.model.Review;
import com.eventhub.model.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    Page<Review> findByVendorAndIsVisibleTrue(Vendor vendor, Pageable pageable);
    List<Review> findByVendorAndIsVisibleTrue(Vendor vendor);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.vendor = :vendor AND r.isVisible = true")
    BigDecimal findAverageRatingByVendor(@Param("vendor") Vendor vendor);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.vendor = :vendor AND r.isVisible = true")
    Long countByVendor(@Param("vendor") Vendor vendor);
    
    List<Review> findByVendorId(UUID vendorId);
}


