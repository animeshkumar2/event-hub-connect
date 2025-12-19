package com.eventhub.repository;

import com.eventhub.model.BookableSetup;
import com.eventhub.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookableSetupRepository extends JpaRepository<BookableSetup, UUID> {
    List<BookableSetup> findByVendorAndIsActiveTrue(Vendor vendor);
    List<BookableSetup> findByVendor(Vendor vendor);
}









