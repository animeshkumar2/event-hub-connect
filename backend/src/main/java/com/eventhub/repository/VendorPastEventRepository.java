package com.eventhub.repository;

import com.eventhub.model.VendorPastEvent;
import com.eventhub.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface VendorPastEventRepository extends JpaRepository<VendorPastEvent, UUID> {
    List<VendorPastEvent> findByVendorOrderByEventDateDesc(Vendor vendor);
    List<VendorPastEvent> findByVendor(Vendor vendor);
}


