package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.Payout;
import com.eventhub.model.VendorWallet;
import com.eventhub.model.WalletTransaction;
import com.eventhub.service.VendorWalletService;
import com.eventhub.util.VendorIdResolver;
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
    private final VendorIdResolver vendorIdResolver;
    
    @GetMapping
    public ResponseEntity<ApiResponse<VendorWallet>> getWallet(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        VendorWallet wallet = walletService.getWallet(vendorId);
        return ResponseEntity.ok(ApiResponse.success(wallet));
    }
    
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Page<WalletTransaction>>> getTransactions(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Pageable pageable = PageRequest.of(page, size);
        Page<WalletTransaction> transactions = walletService.getWalletTransactions(vendorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }
    
    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<Payout>> requestWithdrawal(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestBody VendorWalletService.WithdrawalRequest request) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Payout payout = walletService.requestWithdrawal(vendorId, request);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal request submitted", payout));
    }
    
    @GetMapping("/payouts")
    public ResponseEntity<ApiResponse<Page<Payout>>> getPayoutHistory(
            @RequestHeader(value = "X-Vendor-Id", required = false) UUID headerVendorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID vendorId = vendorIdResolver.resolveVendorId(headerVendorId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Payout> payouts = walletService.getPayoutHistory(vendorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(payouts));
    }
}

