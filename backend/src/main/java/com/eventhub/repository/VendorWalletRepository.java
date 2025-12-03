package com.eventhub.repository;

import com.eventhub.model.VendorWallet;
import com.eventhub.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorWalletRepository extends JpaRepository<VendorWallet, UUID> {
    Optional<VendorWallet> findByVendor(Vendor vendor);
    Optional<VendorWallet> findByVendorId(UUID vendorId);
}

