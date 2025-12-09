package com.eventhub.service;

import com.eventhub.dto.request.CreatePackageRequest;
import com.eventhub.dto.request.CreateItemRequest;
import com.eventhub.model.*;
import com.eventhub.repository.*;
import com.eventhub.exception.NotFoundException;
import com.eventhub.exception.BusinessRuleException;
import com.eventhub.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorListingService {
    
    private final ListingRepository listingRepository;
    private final VendorRepository vendorRepository;
    private final CategoryRepository categoryRepository;
    private final EventTypeRepository eventTypeRepository;
    private final EventTypeCategoryRepository eventTypeCategoryRepository;
    private final AddOnRepository addOnRepository;
    
    /**
     * Create package listing
     */
    public Listing createPackage(UUID vendorId, CreatePackageRequest request) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        
        // Note: Vendors can create listings in any category, not just their primary category
        // This allows vendors to offer services across multiple categories (e.g., a decor vendor can also offer photography)
        
        // Validate event types
        if (request.getEventTypeIds() == null || request.getEventTypeIds().isEmpty()) {
            throw new ValidationException("At least one event type is required");
        }
        
        // Validate category against event types
        for (Integer eventTypeId : request.getEventTypeIds()) {
            EventType eventType = eventTypeRepository.findById(eventTypeId)
                    .orElseThrow(() -> new NotFoundException("Event type not found: " + eventTypeId));
            
            boolean isValid = eventTypeCategoryRepository.existsByEventTypeAndCategory(eventType, category);
            if (!isValid) {
                throw new BusinessRuleException(
                        "Category '" + category.getId() + "' is not valid for event type '" + eventType.getName() + "'");
            }
        }
        
        // Create listing
        Listing listing = new Listing();
        listing.setVendor(vendor);
        listing.setType(Listing.ListingType.PACKAGE);
        listing.setName(request.getName());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setListingCategory(category);
        listing.setIncludedItemsText(request.getIncludedItemsText());
        listing.setExcludedItemsText(request.getExcludedItemsText());
        listing.setDeliveryTime(request.getDeliveryTime());
        listing.setExtraCharges(request.getExtraCharges());
        listing.setImages(request.getImages());
        listing.setIsActive(true);
        
        // Set event types
        List<EventType> eventTypes = request.getEventTypeIds().stream()
                .map(id -> eventTypeRepository.findById(id)
                        .orElseThrow(() -> new NotFoundException("Event type not found: " + id)))
                .collect(Collectors.toList());
        listing.setEventTypes(eventTypes);
        
        listing = listingRepository.save(listing);
        
        return listing;
    }
    
    /**
     * Create individual item listing
     */
    public Listing createItem(UUID vendorId, CreateItemRequest request) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        
        // Note: Vendors can create listings in any category, not just their primary category
        // This allows vendors to offer services across multiple categories (e.g., a decor vendor can also offer photography)
        
        // Validate event types
        if (request.getEventTypeIds() == null || request.getEventTypeIds().isEmpty()) {
            throw new ValidationException("At least one event type is required");
        }
        
        // Validate category against event types
        for (Integer eventTypeId : request.getEventTypeIds()) {
            EventType eventType = eventTypeRepository.findById(eventTypeId)
                    .orElseThrow(() -> new NotFoundException("Event type not found: " + eventTypeId));
            
            boolean isValid = eventTypeCategoryRepository.existsByEventTypeAndCategory(eventType, category);
            if (!isValid) {
                throw new BusinessRuleException(
                        "Category '" + category.getId() + "' is not valid for event type '" + eventType.getName() + "'");
            }
        }
        
        // Create listing
        Listing listing = new Listing();
        listing.setVendor(vendor);
        listing.setType(Listing.ListingType.ITEM);
        listing.setName(request.getName());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setListingCategory(category);
        listing.setUnit(request.getUnit());
        listing.setMinimumQuantity(request.getMinimumQuantity() != null ? request.getMinimumQuantity() : 1);
        listing.setDeliveryTime(request.getDeliveryTime());
        listing.setExtraCharges(request.getExtraCharges());
        listing.setImages(request.getImages());
        listing.setIsActive(true);
        
        // Set event types
        List<EventType> eventTypes = request.getEventTypeIds().stream()
                .map(id -> eventTypeRepository.findById(id)
                        .orElseThrow(() -> new NotFoundException("Event type not found: " + id)))
                .collect(Collectors.toList());
        listing.setEventTypes(eventTypes);
        
        listing = listingRepository.save(listing);
        
        return listing;
    }
    
    public Listing updateListing(UUID listingId, UUID vendorId, Listing updatedListing) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing not found"));
        
        // Verify ownership
        if (!listing.getVendor().getId().equals(vendorId)) {
            throw new BusinessRuleException("You don't have permission to update this listing");
        }
        
        if (updatedListing.getName() != null) {
            listing.setName(updatedListing.getName());
        }
        if (updatedListing.getDescription() != null) {
            listing.setDescription(updatedListing.getDescription());
        }
        if (updatedListing.getPrice() != null) {
            listing.setPrice(updatedListing.getPrice());
        }
        if (updatedListing.getImages() != null) {
            listing.setImages(updatedListing.getImages());
        }
        
        return listingRepository.save(listing);
    }
    
    public void deleteListing(UUID listingId, UUID vendorId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing not found"));
        
        // Verify ownership
        if (!listing.getVendor().getId().equals(vendorId)) {
            throw new BusinessRuleException("You don't have permission to delete this listing");
        }
        
        // Soft delete
        listing.setIsActive(false);
        listingRepository.save(listing);
    }
    
    @Transactional(readOnly = true)
    public List<Listing> getVendorListings(UUID vendorId) {
        return listingRepository.findByVendorIdAndIsActiveTrue(vendorId);
    }
}

