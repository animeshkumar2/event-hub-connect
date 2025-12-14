package com.eventhub.repository;

import com.eventhub.model.WalletTransaction;
import com.eventhub.model.VendorWallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {
    Page<WalletTransaction> findByWalletOrderByCreatedAtDesc(VendorWallet wallet, Pageable pageable);
    List<WalletTransaction> findByWallet(VendorWallet wallet);
}




