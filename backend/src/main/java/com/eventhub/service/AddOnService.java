package com.eventhub.service;

import com.eventhub.model.AddOn;
import com.eventhub.model.Listing;
import com.eventhub.repository.AddOnRepository;
import com.eventhub.repository.ListingRepository;
import com.eventhub.exception.NotFoundException;
import com.eventhub.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AddOnService {
    
    private final AddOnRepository addOnRepository;
    private final ListingRepository listingRepository;
    
    public AddOn createAddOn(UUID packageId, UUID vendorId, AddOn addOn) {
        Listing listing = listingRepository.findById(packageId)
                .orElseThrow(() -> new NotFoundException("Package not found"));
        
        if (listing.getType() != Listing.ListingType.PACKAGE) {
            throw new BusinessRuleException("Add-ons can only be added to packages");
        }
        
        if (!listing.getVendor().getId().equals(vendorId)) {
            throw new BusinessRuleException("You don't have permission to add add-ons to this package");
        }
        
        addOn.setPackageListing(listing);
        return addOnRepository.save(addOn);
    }
    
    public AddOn updateAddOn(UUID addOnId, UUID vendorId, AddOn updatedAddOn) {
        AddOn addOn = addOnRepository.findById(addOnId)
                .orElseThrow(() -> new NotFoundException("Add-on not found"));
        
        if (!addOn.getPackageListing().getVendor().getId().equals(vendorId)) {
            throw new BusinessRuleException("You don't have permission to update this add-on");
        }
        
        if (updatedAddOn.getTitle() != null) {
            addOn.setTitle(updatedAddOn.getTitle());
        }
        if (updatedAddOn.getDescription() != null) {
            addOn.setDescription(updatedAddOn.getDescription());
        }
        if (updatedAddOn.getPrice() != null) {
            addOn.setPrice(updatedAddOn.getPrice());
        }
        if (updatedAddOn.getIsActive() != null) {
            addOn.setIsActive(updatedAddOn.getIsActive());
        }
        
        return addOnRepository.save(addOn);
    }
    
    public void deleteAddOn(UUID addOnId, UUID vendorId) {
        AddOn addOn = addOnRepository.findById(addOnId)
                .orElseThrow(() -> new NotFoundException("Add-on not found"));
        
        if (!addOn.getPackageListing().getVendor().getId().equals(vendorId)) {
            throw new BusinessRuleException("You don't have permission to delete this add-on");
        }
        
        addOnRepository.delete(addOn);
    }
    
    @Transactional(readOnly = true)
    public List<AddOn> getPackageAddOns(UUID packageId) {
        Listing listing = listingRepository.findById(packageId)
                .orElseThrow(() -> new NotFoundException("Package not found"));
        return addOnRepository.findByPackageListingAndIsActiveTrue(listing);
    }
}

