package com.eventhub.util;

import com.eventhub.exception.VendorProfileNotFoundException;
import com.eventhub.model.Vendor;
import com.eventhub.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class VendorIdResolver {
    
    private final VendorRepository vendorRepository;
    
    /**
     * Resolves vendor ID from the authenticated user.
     * First tries to get from X-Vendor-Id header (if provided),
     * otherwise looks up vendor by user_id from JWT token.
     * 
     * For ADMIN users: allows using X-Vendor-Id header directly without ownership verification
     * (enables admin to test vendor APIs for any vendor)
     */
    public UUID resolveVendorId(UUID headerVendorId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new IllegalStateException("User not authenticated");
        }
        
        UUID userId = UUID.fromString(auth.getName());
        
        // Check if user is admin - allow them to use any vendor ID from header
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (isAdmin) {
            if (headerVendorId != null) {
                // Admin can use any vendor ID for testing purposes
                Vendor vendor = vendorRepository.findById(headerVendorId)
                        .orElseThrow(() -> new VendorProfileNotFoundException("Vendor not found with ID: " + headerVendorId));
                return vendor.getId();
            } else {
                // Admin didn't provide vendor ID - use first available vendor for testing
                // Use efficient paginated query instead of findAll()
                List<Vendor> vendors = vendorRepository.findFirstActiveVendor(PageRequest.of(0, 1));
                if (vendors.isEmpty()) {
                    throw new VendorProfileNotFoundException("No vendors found in the system. Please create a vendor first.");
                }
                return vendors.get(0).getId();
            }
        }
        
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

