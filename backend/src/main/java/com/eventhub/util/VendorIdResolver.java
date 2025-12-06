package com.eventhub.util;

import com.eventhub.exception.VendorProfileNotFoundException;
import com.eventhub.model.Vendor;
import com.eventhub.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class VendorIdResolver {
    
    private final VendorRepository vendorRepository;
    
    /**
     * Resolves vendor ID from the authenticated user.
     * First tries to get from X-Vendor-Id header (if provided),
     * otherwise looks up vendor by user_id from JWT token.
     */
    public UUID resolveVendorId(UUID headerVendorId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new IllegalStateException("User not authenticated");
        }
        
        UUID userId = UUID.fromString(auth.getName());
        
        // If header vendor ID is provided, verify it belongs to the authenticated user
        if (headerVendorId != null) {
            Vendor vendor = vendorRepository.findById(headerVendorId)
                    .orElse(null);
            if (vendor != null && vendor.getUserId().equals(userId)) {
                return headerVendorId;
            }
        }
        
        // Otherwise, get vendor ID from authenticated user
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new VendorProfileNotFoundException("Vendor profile not found. Please complete vendor onboarding first."));
        
        return vendor.getId();
    }
    
    /**
     * Gets vendor ID from authenticated user (ignores header)
     */
    public UUID getVendorIdFromAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new IllegalStateException("User not authenticated");
        }
        
        UUID userId = UUID.fromString(auth.getName());
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new VendorProfileNotFoundException("Vendor profile not found. Please complete vendor onboarding first."));
        
        return vendor.getId();
    }
}

