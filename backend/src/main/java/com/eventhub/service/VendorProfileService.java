package com.eventhub.service;

import com.eventhub.model.*;
import com.eventhub.repository.*;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorProfileService {
    
    private final VendorRepository vendorRepository;
    private final ListingRepository listingRepository;
    private final ReviewRepository reviewRepository;
    private final VendorFAQRepository vendorFAQRepository;
    private final VendorPastEventRepository vendorPastEventRepository;
    private final BookableSetupRepository bookableSetupRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;
    
    @Transactional(readOnly = true)
    public Vendor getVendorProfile(UUID vendorId) {
        // Use optimized query with pre-loaded relationships
        return vendorRepository.findByIdWithDetails(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
    }
    
    public Vendor updateVendorProfile(UUID vendorId, Vendor updatedVendor) {
        Vendor vendor = getVendorProfile(vendorId);
        
        if (updatedVendor.getBusinessName() != null) {
            vendor.setBusinessName(updatedVendor.getBusinessName());
        }
        if (updatedVendor.getBio() != null) {
            vendor.setBio(updatedVendor.getBio());
        }
        if (updatedVendor.getCoverImage() != null) {
            vendor.setCoverImage(updatedVendor.getCoverImage());
        }
        if (updatedVendor.getProfileImage() != null) {
            vendor.setProfileImage(updatedVendor.getProfileImage());
        }
        if (updatedVendor.getPortfolioImages() != null) {
            vendor.setPortfolioImages(updatedVendor.getPortfolioImages());
        }
        if (updatedVendor.getCoverageRadius() != null) {
            vendor.setCoverageRadius(updatedVendor.getCoverageRadius());
        }
        // Contact Info Fields
        if (updatedVendor.getPhone() != null) {
            vendor.setPhone(updatedVendor.getPhone());
        }
        if (updatedVendor.getEmail() != null) {
            vendor.setEmail(updatedVendor.getEmail());
        }
        if (updatedVendor.getInstagram() != null) {
            vendor.setInstagram(updatedVendor.getInstagram());
        }
        if (updatedVendor.getWebsite() != null) {
            vendor.setWebsite(updatedVendor.getWebsite());
        }
        
        return vendorRepository.save(vendor);
    }
    
    @Transactional(readOnly = true)
    public List<Listing> getVendorPackages(UUID vendorId) {
        Vendor vendor = getVendorProfile(vendorId);
        // Get all packages and filter out drafts (customer-facing endpoint)
        List<Listing> packages = listingRepository.findByVendorIdAndTypeWithRelationships(vendorId, Listing.ListingType.PACKAGE);
        // Filter out drafts: price > 0.01 and has images
        return packages.stream()
            .filter(l -> l.getPrice().compareTo(new java.math.BigDecimal("0.01")) > 0)
            .filter(l -> l.getImages() != null && !l.getImages().isEmpty())
            .collect(java.util.stream.Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<Listing> getVendorListings(UUID vendorId) {
        Vendor vendor = getVendorProfile(vendorId);
        // Get all listings and filter out drafts (customer-facing endpoint)
        List<Listing> listings = listingRepository.findByVendorIdAndTypeWithRelationships(vendorId, Listing.ListingType.ITEM);
        // Filter out drafts: price > 0.01 and has images
        return listings.stream()
            .filter(l -> l.getPrice().compareTo(new java.math.BigDecimal("0.01")) > 0)
            .filter(l -> l.getImages() != null && !l.getImages().isEmpty())
            .collect(java.util.stream.Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<Review> getVendorReviews(UUID vendorId) {
        Vendor vendor = getVendorProfile(vendorId);
        return reviewRepository.findByVendorAndIsVisibleTrue(vendor);
    }
    
    @Transactional(readOnly = true)
    public List<VendorFAQ> getVendorFAQs(UUID vendorId) {
        Vendor vendor = getVendorProfile(vendorId);
        return vendorFAQRepository.findByVendorOrderByDisplayOrderAsc(vendor);
    }
    
    @Transactional(readOnly = true)
    public List<VendorPastEvent> getVendorPastEvents(UUID vendorId) {
        Vendor vendor = getVendorProfile(vendorId);
        return vendorPastEventRepository.findByVendorOrderByEventDateDesc(vendor);
    }
    
    @Transactional(readOnly = true)
    public List<BookableSetup> getVendorBookableSetups(UUID vendorId) {
        Vendor vendor = getVendorProfile(vendorId);
        return bookableSetupRepository.findByVendorAndIsActiveTrue(vendor);
    }
    
    @Transactional(readOnly = true)
    public List<AvailabilitySlot> getVendorAvailability(UUID vendorId, java.time.LocalDate startDate, java.time.LocalDate endDate) {
        Vendor vendor = getVendorProfile(vendorId);
        return availabilitySlotRepository.findByVendorAndDateBetween(vendor, startDate, endDate);
    }
}

