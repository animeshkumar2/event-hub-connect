package com.eventhub.service;

import com.eventhub.dto.request.CreatePackageRequest;
import com.eventhub.dto.request.CreateItemRequest;
import com.eventhub.model.*;
import com.eventhub.repository.*;
import com.eventhub.exception.NotFoundException;
import com.eventhub.exception.BusinessRuleException;
import com.eventhub.exception.ValidationException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Create package listing
     */
    public Listing createPackage(UUID vendorId, CreatePackageRequest request) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        
        // Validate custom category name if "other" is selected
        if ("other".equalsIgnoreCase(request.getCategoryId())) {
            if (request.getCustomCategoryName() == null || request.getCustomCategoryName().trim().isEmpty()) {
                throw new ValidationException("Custom category name is required when selecting 'Other' category");
            }
        }
        
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
        
        // Validate linked items if provided
        if (request.getIncludedItemIds() != null && !request.getIncludedItemIds().isEmpty()) {
            for (UUID itemId : request.getIncludedItemIds()) {
                Listing item = listingRepository.findById(itemId)
                        .orElseThrow(() -> new NotFoundException("Linked item not found: " + itemId));
                if (!item.getVendor().getId().equals(vendorId)) {
                    throw new BusinessRuleException("Can only include your own items in a package");
                }
                if (item.getType() != Listing.ListingType.ITEM) {
                    throw new BusinessRuleException("Can only include items (not packages) in a package");
                }
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
        listing.setCustomCategoryName("other".equalsIgnoreCase(request.getCategoryId()) ? request.getCustomCategoryName() : null);
        listing.setHighlights(request.getHighlights());
        listing.setIncludedItemsText(request.getIncludedItemsText());
        listing.setIncludedItemIds(request.getIncludedItemIds());
        listing.setExcludedItemsText(request.getExcludedItemsText());
        listing.setDeliveryTime(request.getDeliveryTime());
        listing.setExtraCharges(request.getExtraCharges());
        
        // Convert detailed extra charges to JSON
        if (request.getExtraChargesDetailed() != null && !request.getExtraChargesDetailed().isEmpty()) {
            try {
                listing.setExtraChargesJson(objectMapper.writeValueAsString(request.getExtraChargesDetailed()));
            } catch (JsonProcessingException e) {
                // Fall back to text-based charges
                listing.setExtraCharges(request.getExtraCharges());
            }
        }
        
        listing.setImages(request.getImages());
        // Use isActive from request, default to true if not specified
        listing.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        // Use isDraft from request, default to false if not specified
        listing.setIsDraft(request.getIsDraft() != null ? request.getIsDraft() : false);
        listing.setOpenForNegotiation(request.getOpenForNegotiation() != null ? request.getOpenForNegotiation() : true);
        
        // Store category-specific data as JSON
        if (request.getCategorySpecificData() != null) {
            try {
                // If it's already a string (JSON), use it directly; otherwise serialize it
                if (request.getCategorySpecificData() instanceof String) {
                    listing.setCategorySpecificData((String) request.getCategorySpecificData());
                } else {
                    listing.setCategorySpecificData(objectMapper.writeValueAsString(request.getCategorySpecificData()));
                }
            } catch (JsonProcessingException e) {
                // Log error but don't fail the request
                System.err.println("Failed to serialize category-specific data: " + e.getMessage());
            }
        }
        
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
        
        // Validate custom category name if "other" is selected
        if ("other".equalsIgnoreCase(request.getCategoryId())) {
            if (request.getCustomCategoryName() == null || request.getCustomCategoryName().trim().isEmpty()) {
                throw new ValidationException("Custom category name is required when selecting 'Other' category");
            }
        }
        
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
        listing.setCustomCategoryName("other".equalsIgnoreCase(request.getCategoryId()) ? request.getCustomCategoryName() : null);
        listing.setHighlights(request.getHighlights());
        listing.setIncludedItemsText(request.getIncludedItemsText());
        listing.setExcludedItemsText(request.getExcludedItemsText());
        listing.setUnit(request.getUnit());
        listing.setMinimumQuantity(request.getMinimumQuantity() != null ? request.getMinimumQuantity() : 1);
        listing.setDeliveryTime(request.getDeliveryTime());
        listing.setCustomNotes(request.getCustomNotes());
        listing.setExtraCharges(request.getExtraCharges());
        
        // Convert detailed extra charges to JSON
        if (request.getExtraChargesDetailed() != null && !request.getExtraChargesDetailed().isEmpty()) {
            try {
                listing.setExtraChargesJson(objectMapper.writeValueAsString(request.getExtraChargesDetailed()));
            } catch (JsonProcessingException e) {
                listing.setExtraCharges(request.getExtraCharges());
            }
        }
        
        listing.setImages(request.getImages());
        // Use isActive from request, default to true if not specified
        listing.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        // Use isDraft from request, default to false if not specified
        listing.setIsDraft(request.getIsDraft() != null ? request.getIsDraft() : false);
        listing.setOpenForNegotiation(request.getOpenForNegotiation() != null ? request.getOpenForNegotiation() : true);
        
        // Store category-specific data as JSON
        if (request.getCategorySpecificData() != null) {
            try {
                // If it's already a string (JSON), use it directly; otherwise serialize it
                if (request.getCategorySpecificData() instanceof String) {
                    listing.setCategorySpecificData((String) request.getCategorySpecificData());
                } else {
                    listing.setCategorySpecificData(objectMapper.writeValueAsString(request.getCategorySpecificData()));
                }
            } catch (JsonProcessingException e) {
                // Log error but don't fail the request
                System.err.println("Failed to serialize category-specific data: " + e.getMessage());
            }
        }
        
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
        
        // Basic fields
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
        
        // Category and custom category name
        if (updatedListing.getListingCategory() != null) {
            listing.setListingCategory(updatedListing.getListingCategory());
            // Update custom category name based on category
            if ("other".equalsIgnoreCase(updatedListing.getListingCategory().getId())) {
                listing.setCustomCategoryName(updatedListing.getCustomCategoryName());
            } else {
                listing.setCustomCategoryName(null);
            }
        }
        // If only customCategoryName is updated (category unchanged but is "other")
        if (updatedListing.getCustomCategoryName() != null && 
            listing.getListingCategory() != null && 
            "other".equalsIgnoreCase(listing.getListingCategory().getId())) {
            listing.setCustomCategoryName(updatedListing.getCustomCategoryName());
        }
        
        // Package-specific fields
        if (updatedListing.getHighlights() != null) {
            listing.setHighlights(updatedListing.getHighlights());
        }
        if (updatedListing.getIncludedItemIds() != null) {
            listing.setIncludedItemIds(updatedListing.getIncludedItemIds());
        }
        if (updatedListing.getIncludedItemsText() != null) {
            listing.setIncludedItemsText(updatedListing.getIncludedItemsText());
        }
        if (updatedListing.getExcludedItemsText() != null) {
            listing.setExcludedItemsText(updatedListing.getExcludedItemsText());
        }
        if (updatedListing.getDeliveryTime() != null) {
            listing.setDeliveryTime(updatedListing.getDeliveryTime());
        }
        if (updatedListing.getCustomNotes() != null) {
            listing.setCustomNotes(updatedListing.getCustomNotes());
        }
        if (updatedListing.getExtraCharges() != null) {
            listing.setExtraCharges(updatedListing.getExtraCharges());
        }
        if (updatedListing.getExtraChargesJson() != null) {
            listing.setExtraChargesJson(updatedListing.getExtraChargesJson());
        }
        
        // Item-specific fields
        if (updatedListing.getUnit() != null) {
            listing.setUnit(updatedListing.getUnit());
        }
        if (updatedListing.getMinimumQuantity() != null) {
            listing.setMinimumQuantity(updatedListing.getMinimumQuantity());
        }
        
        // Status
        if (updatedListing.getIsActive() != null) {
            listing.setIsActive(updatedListing.getIsActive());
        }
        if (updatedListing.getIsDraft() != null) {
            listing.setIsDraft(updatedListing.getIsDraft());
        }
        if (updatedListing.getOpenForNegotiation() != null) {
            listing.setOpenForNegotiation(updatedListing.getOpenForNegotiation());
        }
        
        // Category-specific data
        if (updatedListing.getCategorySpecificData() != null) {
            listing.setCategorySpecificData(updatedListing.getCategorySpecificData());
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
        
        // Check if listing has any orders - if so, only soft delete
        boolean hasOrders = orderRepository.existsByListingId(listingId);
        
        // Hard delete for:
        // 1. Draft listings (isDraft = true)
        // 2. Inactive listings with no orders (never published or deactivated with no bookings)
        boolean isDraft = listing.getIsDraft() != null && listing.getIsDraft();
        boolean isInactive = listing.getIsActive() == null || !listing.getIsActive();
        
        if (isDraft || (isInactive && !hasOrders)) {
            // Can be permanently deleted
            listingRepository.delete(listing);
        } else {
            // Active listings or listings with orders are soft deleted
            listing.setIsActive(false);
            listingRepository.save(listing);
        }
    }
    
    @Transactional(readOnly = true)
    public List<Listing> getVendorListings(UUID vendorId) {
        // Use query with JOIN FETCH to load event types
        List<Listing> listings = listingRepository.findByVendorIdWithEventTypes(vendorId);
        
        // Populate eventTypeIds for JSON serialization
        listings.forEach(listing -> {
            if (listing.getEventTypes() != null) {
                List<Integer> eventTypeIds = listing.getEventTypes().stream()
                        .map(EventType::getId)
                        .toList();
                listing.setEventTypeIds(eventTypeIds);
            }
        });
        
        return listings;
    }
}

