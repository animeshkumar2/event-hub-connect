package com.eventhub.service;

import com.eventhub.model.VendorWallet;
import com.eventhub.model.Vendor;
import com.eventhub.model.WalletTransaction;
import com.eventhub.model.Payout;
import com.eventhub.repository.VendorWalletRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.repository.WalletTransactionRepository;
import com.eventhub.repository.PayoutRepository;
import com.eventhub.exception.NotFoundException;
import com.eventhub.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorWalletService {
    
    private final VendorWalletRepository vendorWalletRepository;
    private final VendorRepository vendorRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final PayoutRepository payoutRepository;
    
    private static final BigDecimal MIN_WITHDRAWAL_AMOUNT = new BigDecimal("1000");
    
    public VendorWallet getWallet(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        return vendorWalletRepository.findByVendorId(vendorId)
                .orElseGet(() -> createWalletForVendor(vendor));
    }
    
    private VendorWallet createWalletForVendor(Vendor vendor) {
        VendorWallet wallet = new VendorWallet();
        wallet.setVendorId(vendor.getId());
        // Don't set vendor directly - it's read-only via insertable=false, updatable=false
        wallet.setBalance(BigDecimal.ZERO);
        wallet.setPendingPayouts(BigDecimal.ZERO);
        wallet.setTotalEarnings(BigDecimal.ZERO);
        return vendorWalletRepository.save(wallet);
    }
    
    @Transactional(readOnly = true)
    public Page<WalletTransaction> getWalletTransactions(UUID vendorId, Pageable pageable) {
        VendorWallet wallet = getWallet(vendorId);
        return walletTransactionRepository.findByWalletOrderByCreatedAtDesc(wallet, pageable);
    }
    
    public Payout requestWithdrawal(UUID vendorId, WithdrawalRequest request) {
        VendorWallet wallet = getWallet(vendorId);
        
        if (request.getAmount().compareTo(MIN_WITHDRAWAL_AMOUNT) < 0) {
            throw new BusinessRuleException("Minimum withdrawal amount is ₹" + MIN_WITHDRAWAL_AMOUNT);
        }
        
        if (request.getAmount().compareTo(wallet.getBalance()) > 0) {
            throw new BusinessRuleException("Insufficient balance");
        }
        
        // Create payout request
        Payout payout = new Payout();
        payout.setVendor(wallet.getVendor());
        payout.setAmount(request.getAmount());
        payout.setBankAccountNumber(request.getBankAccountNumber());
        payout.setBankIfsc(request.getBankIfsc());
        payout.setBankName(request.getBankName());
        payout.setAccountHolderName(request.getAccountHolderName());
        payout.setStatus(Payout.PayoutStatus.PENDING);
        
        // Hold amount in wallet
        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        vendorWalletRepository.save(wallet);
        
        return payoutRepository.save(payout);
    }
    
    @Transactional(readOnly = true)
    public Page<Payout> getPayoutHistory(UUID vendorId, Pageable pageable) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        return payoutRepository.findByVendorOrderByCreatedAtDesc(vendor, pageable);
    }
    
    @lombok.Data
    public static class WithdrawalRequest {
        private BigDecimal amount;
        private String bankAccountNumber;
        private String bankIfsc;
        private String bankName;
        private String accountHolderName;
    }
}

