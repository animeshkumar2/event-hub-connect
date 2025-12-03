package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Payout;
import com.eventhub.model.VendorWallet;
import com.eventhub.model.WalletTransaction;
import com.eventhub.service.VendorWalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/vendors/wallet")
@RequiredArgsConstructor
public class VendorWalletController {
    
    private final VendorWalletService walletService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<VendorWallet>> getWallet(@RequestHeader("X-Vendor-Id") UUID vendorId) {
        VendorWallet wallet = walletService.getWallet(vendorId);
        return ResponseEntity.ok(ApiResponse.success(wallet));
    }
    
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<WalletTransaction>>> getTransactions(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<WalletTransaction> transactions = walletService.getWalletTransactions(vendorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }
    
    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<Payout>> requestWithdrawal(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @RequestBody VendorWalletService.WithdrawalRequest request) {
        Payout payout = walletService.requestWithdrawal(vendorId, request);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal request submitted", payout));
    }
    
    @GetMapping("/payouts")
    public ResponseEntity<ApiResponse<Page<Payout>>> getPayoutHistory(
            @RequestHeader("X-Vendor-Id") UUID vendorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Payout> payouts = walletService.getPayoutHistory(vendorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(payouts));
    }
}

