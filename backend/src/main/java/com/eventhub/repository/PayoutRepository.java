package com.eventhub.repository;

import com.eventhub.model.Payout;
import com.eventhub.model.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, UUID> {
    Page<Payout> findByVendorOrderByCreatedAtDesc(Vendor vendor, Pageable pageable);
    List<Payout> findByVendorAndStatus(Vendor vendor, Payout.PayoutStatus status);
}











