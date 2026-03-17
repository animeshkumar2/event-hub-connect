package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.CustomerAddress;
import com.eventhub.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers/addresses")
@RequiredArgsConstructor
public class CustomerAddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerAddress>>> getAddresses(@RequestHeader("X-User-Id") UUID userId) {
        List<CustomerAddress> addresses = addressService.getAddresses(userId);
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerAddress>> createAddress(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody CustomerAddress address) {
        CustomerAddress created = addressService.createAddress(userId, address);
        return ResponseEntity.ok(ApiResponse.success("Address saved", created));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<CustomerAddress>> updateAddress(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID addressId,
            @RequestBody CustomerAddress address) {
        CustomerAddress updated = addressService.updateAddress(userId, addressId, address);
        return ResponseEntity.ok(ApiResponse.success("Address updated", updated));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID addressId) {
        addressService.deleteAddress(userId, addressId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }

    @PutMapping("/{addressId}/default")
    public ResponseEntity<ApiResponse<CustomerAddress>> setDefault(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID addressId) {
        CustomerAddress address = addressService.setDefault(userId, addressId);
        return ResponseEntity.ok(ApiResponse.success("Default address updated", address));
    }
}
