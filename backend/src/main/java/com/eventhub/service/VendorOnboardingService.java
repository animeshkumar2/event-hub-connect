package com.eventhub.service;

import com.eventhub.dto.request.VendorOnboardingRequest;
import com.eventhub.exception.ValidationException;
import com.eventhub.model.Category;
import com.eventhub.model.Listing;
import com.eventhub.model.Vendor;
import com.eventhub.model.UserProfile;
import com.eventhub.repository.CategoryRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.repository.ListingRepository;
import com.eventhub.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorOnboardingService {
    
    private final VendorRepository vendorRepository;
    private final CategoryRepository categoryRepository;
    private final ListingRepository listingRepository;
    private final UserProfileRepository userProfileRepository;
    
    public Vendor onboardVendor(VendorOnboardingRequest request) {
        // Get authenticated user ID
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new ValidationException("User not authenticated");
        }
        
        UUID userId = UUID.fromString(auth.getName());
        
        // Check if vendor already exists
        if (vendorRepository.findByUserId(userId).isPresent()) {
            throw new ValidationException("Vendor profile already exists for this user");
        }
        
        // Get category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ValidationException("Category not found: " + request.getCategoryId()));
        
        // Create vendor
        Vendor vendor = new Vendor();
        vendor.setUserId(userId);
        vendor.setBusinessName(request.getBusinessName());
        vendor.setVendorCategory(category);
        vendor.setCityName(request.getCityName());
        vendor.setBio(request.getBio());
        vendor.setStartingPrice(request.getPrice());
        vendor.setIsActive(true);
        vendor.setIsVerified(false);
        vendor.setRating(java.math.BigDecimal.ZERO);
        vendor.setReviewCount(0);
        
        // Set cover image if provided
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            vendor.setCoverImage(request.getImages().get(0));
            vendor.setPortfolioImages(request.getImages());
        }
        
        vendor = vendorRepository.save(vendor);
        
        // Update user role to VENDOR
        UserProfile userProfile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ValidationException("User profile not found"));
        userProfile.setRole(UserProfile.Role.VENDOR);
        userProfileRepository.save(userProfile);
        
        // Create first listing only if listing details are provided
        if (request.getListingName() != null && !request.getListingName().trim().isEmpty() 
            && request.getPrice() != null && request.getPrice().compareTo(java.math.BigDecimal.ZERO) > 0) {
            Listing listing = new Listing();
            listing.setVendor(vendor);
            listing.setName(request.getListingName());
            listing.setDescription(request.getDescription());
            listing.setPrice(request.getPrice());
            listing.setType(Listing.ListingType.PACKAGE);
            listing.setListingCategory(category);
            listing.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
            listing.setIsPopular(false);
            listing.setIsTrending(false);
            
            // Set included items if provided
            if (request.getIncludedItemsText() != null && !request.getIncludedItemsText().isEmpty()) {
                listing.setIncludedItemsText(request.getIncludedItemsText());
            }
            
            if (request.getImages() != null && !request.getImages().isEmpty()) {
                listing.setImages(request.getImages());
            }
            
            listingRepository.save(listing);
        }
        
        return vendor;
    }
}

