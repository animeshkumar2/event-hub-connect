package com.eventhub.repository;

import com.eventhub.model.VendorFAQ;
import com.eventhub.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface VendorFAQRepository extends JpaRepository<VendorFAQ, UUID> {
    List<VendorFAQ> findByVendorOrderByDisplayOrderAsc(Vendor vendor);
    List<VendorFAQ> findByVendor(Vendor vendor);
}


