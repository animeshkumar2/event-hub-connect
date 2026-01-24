package com.eventhub.service;

import com.eventhub.model.*;
import com.eventhub.repository.*;
import com.eventhub.exception.NotFoundException;
import com.eventhub.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final ListingRepository listingRepository;
    private final VendorRepository vendorRepository;
    private final AddOnRepository addOnRepository;
    private final CartItemAddOnRepository cartItemAddOnRepository;
    
    /**
     * Add item to cart
     */
    public CartItem addToCart(UUID userId, UUID listingId, Integer quantity, 
                             List<UUID> addOnIds, java.util.Map<String, Object> customizations) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing not found"));
        
        if (!listing.getIsActive()) {
            throw new BusinessRuleException("Listing is not active");
        }
        
        Vendor vendor = listing.getVendor();
        if (vendor == null) {
            throw new BusinessRuleException("Listing vendor is not set");
        }
        
        BigDecimal basePrice = listing.getPrice();
        if (basePrice == null) {
            throw new BusinessRuleException("Listing price is not set");
        }
        BigDecimal finalPrice = basePrice;
        
        // Calculate add-ons total
        if (addOnIds != null && !addOnIds.isEmpty() && listing.getType() == Listing.ListingType.PACKAGE) {
            for (UUID addOnId : addOnIds) {
                try {
                    AddOn addOn = addOnRepository.findById(addOnId).orElse(null);
                    if (addOn != null && addOn.getIsActive() != null && addOn.getIsActive()) {
                        // Check if add-on belongs to this listing
                        if (addOn.getPackageListing() != null && 
                            addOn.getPackageListing().getId().equals(listingId)) {
                            if (addOn.getPrice() != null) {
                                finalPrice = finalPrice.add(addOn.getPrice());
                            }
                        }
                    }
                } catch (Exception e) {
                    // Skip invalid add-on IDs - log but don't fail
                    System.err.println("Warning: Error processing add-on " + addOnId + ": " + e.getMessage());
                }
            }
        }
        
        // Calculate customizations price (if any)
        BigDecimal customizationsPrice = BigDecimal.ZERO;
        if (customizations != null && customizations.containsKey("price")) {
            Object priceObj = customizations.get("price");
            if (priceObj instanceof Number) {
                customizationsPrice = BigDecimal.valueOf(((Number) priceObj).doubleValue());
            } else if (priceObj instanceof String) {
                try {
                    customizationsPrice = new BigDecimal((String) priceObj);
                } catch (NumberFormatException e) {
                    // Ignore invalid price
                }
            }
        }
        finalPrice = finalPrice.add(customizationsPrice);
        
        CartItem cartItem = new CartItem();
        cartItem.setUserId(userId);
        cartItem.setVendor(vendor);
        cartItem.setListing(listing);
        
        // Ensure itemType is set correctly - convert enum to lowercase string for database
        Listing.ListingType listingType = listing.getType();
        if (listingType == null) {
            throw new BusinessRuleException("Listing type is not set");
        }
        // Convert enum to lowercase string to match database constraint
        cartItem.setItemTypeEnum(listingType);
        
        cartItem.setQuantity(quantity != null && quantity > 0 ? quantity : 1);
        cartItem.setBasePrice(basePrice);
        cartItem.setFinalPrice(finalPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        cartItem.setCustomizations(customizations);
        
        CartItem savedItem = cartItemRepository.save(cartItem);
        
        // Save cart item add-ons if provided (optional - don't fail if repository unavailable)
        if (addOnIds != null && !addOnIds.isEmpty() && savedItem.getId() != null) {
            try {
                for (UUID addOnId : addOnIds) {
                    AddOn addOn = addOnRepository.findById(addOnId).orElse(null);
                    if (addOn != null) {
                        CartItemAddOn cartItemAddOn = new CartItemAddOn();
                        cartItemAddOn.setCartItem(savedItem);
                        cartItemAddOn.setAddOn(addOn);
                        cartItemAddOn.setQuantity(1);
                        cartItemAddOn.setPrice(addOn.getPrice());
                        cartItemAddOnRepository.save(cartItemAddOn);
                    }
                }
            } catch (Exception e) {
                // Log but don't fail - add-ons are already in price
                System.err.println("Warning: Could not save cart item add-ons: " + e.getMessage());
            }
        }
        
        return savedItem;
    }
    
    /**
     * Get cart items for user
     */
    @Transactional(readOnly = true)
    public List<CartItem> getCartItems(UUID userId) {
        return cartItemRepository.findByUserIdWithRelationships(userId);
    }
    
    /**
     * Calculate cart summary (subtotal, platform fee, GST, total)
     */
    @Transactional(readOnly = true)
    public CartSummary calculateCartSummary(UUID userId) {
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        
        BigDecimal subtotal = items.stream()
                .map(item -> item.getFinalPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Platform fee: 5% of subtotal
        BigDecimal platformFee = subtotal.multiply(new BigDecimal("0.05"))
                .setScale(2, RoundingMode.HALF_UP);
        
        // GST: 18% of subtotal
        BigDecimal gst = subtotal.multiply(new BigDecimal("0.18"))
                .setScale(2, RoundingMode.HALF_UP);
        
        // Total
        BigDecimal total = subtotal.add(platformFee).add(gst);
        
        return new CartSummary(subtotal, platformFee, gst, total);
    }
    
    /**
     * Update cart item
     */
    public CartItem updateCartItem(UUID cartItemId, Integer quantity, 
                                   List<UUID> addOnIds, java.util.Map<String, Object> customizations) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new NotFoundException("Cart item not found"));
        
        if (quantity != null && quantity > 0) {
            cartItem.setQuantity(quantity);
        }
        
        // Recalculate final price
        BigDecimal basePrice = cartItem.getBasePrice();
        BigDecimal finalPrice = basePrice;
        
        // Recalculate add-ons
        if (addOnIds != null && !addOnIds.isEmpty()) {
            for (UUID addOnId : addOnIds) {
                try {
                    AddOn addOn = addOnRepository.findById(addOnId).orElse(null);
                    if (addOn != null && addOn.getIsActive() != null && addOn.getIsActive()) {
                        if (addOn.getPrice() != null) {
                            finalPrice = finalPrice.add(addOn.getPrice());
                        }
                    }
                } catch (Exception e) {
                    // Skip invalid add-on IDs - log but don't fail
                    System.err.println("Warning: Error processing add-on " + addOnId + ": " + e.getMessage());
                }
            }
        }
        
        // Recalculate customizations price
        BigDecimal customizationsPrice = BigDecimal.ZERO;
        if (customizations != null && customizations.containsKey("price")) {
            Object priceObj = customizations.get("price");
            if (priceObj instanceof Number) {
                customizationsPrice = BigDecimal.valueOf(((Number) priceObj).doubleValue());
            } else if (priceObj instanceof String) {
                try {
                    customizationsPrice = new BigDecimal((String) priceObj);
                } catch (NumberFormatException e) {
                    // Ignore invalid price
                }
            }
        }
        finalPrice = finalPrice.add(customizationsPrice);
        
        cartItem.setFinalPrice(finalPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        cartItem.setCustomizations(customizations);
        
        return cartItemRepository.save(cartItem);
    }
    
    /**
     * Remove item from cart
     */
    public void removeFromCart(UUID cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }
    
    /**
     * Clear cart
     */
    public void clearCart(UUID userId) {
        cartItemRepository.deleteByUserId(userId);
    }
    
    // Inner class for cart summary
    public static class CartSummary {
        private final BigDecimal subtotal;
        private final BigDecimal platformFee;
        private final BigDecimal gst;
        private final BigDecimal total;
        
        public CartSummary(BigDecimal subtotal, BigDecimal platformFee, BigDecimal gst, BigDecimal total) {
            this.subtotal = subtotal;
            this.platformFee = platformFee;
            this.gst = gst;
            this.total = total;
        }
        
        public BigDecimal getSubtotal() { return subtotal; }
        public BigDecimal getPlatformFee() { return platformFee; }
        public BigDecimal getGst() { return gst; }
        public BigDecimal getTotal() { return total; }
    }
}

