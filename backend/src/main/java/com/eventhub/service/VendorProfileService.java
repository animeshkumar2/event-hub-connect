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
        return vendorRepository.findById(vendorId)
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
        if (updatedVendor.getPortfolioImages() != null) {
            vendor.setPortfolioImages(updatedVendor.getPortfolioImages());
        }
        if (updatedVendor.getCoverageRadius() != null) {
            vendor.setCoverageRadius(updatedVendor.getCoverageRadius());
        }
        
        return vendorRepository.save(vendor);
    }
    
    @Transactional(readOnly = true)
    public List<Listing> getVendorPackages(UUID vendorId) {
        Vendor vendor = getVendorProfile(vendorId);
        return listingRepository.findByVendorIdAndTypeAndIsActiveTrue(vendorId, Listing.ListingType.PACKAGE);
    }
    
    @Transactional(readOnly = true)
    public List<Listing> getVendorListings(UUID vendorId) {
        Vendor vendor = getVendorProfile(vendorId);
        return listingRepository.findByVendorIdAndTypeAndIsActiveTrue(vendorId, Listing.ListingType.ITEM);
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

