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
        BigDecimal basePrice = listing.getPrice();
        BigDecimal finalPrice = basePrice;
        
        // Calculate add-ons total
        if (addOnIds != null && !addOnIds.isEmpty() && listing.getType() == Listing.ListingType.PACKAGE) {
            for (UUID addOnId : addOnIds) {
                AddOn addOn = addOnRepository.findById(addOnId)
                        .orElseThrow(() -> new NotFoundException("Add-on not found"));
                if (addOn.getPackageListing().getId().equals(listingId) && addOn.getIsActive()) {
                    finalPrice = finalPrice.add(addOn.getPrice());
                }
            }
        }
        
        // Calculate customizations (if any)
        // This would be implemented based on customization structure
        
        CartItem cartItem = new CartItem();
        cartItem.setUserId(userId);
        cartItem.setVendor(vendor);
        cartItem.setListing(listing);
        cartItem.setItemType(listing.getType());
        cartItem.setQuantity(quantity);
        cartItem.setBasePrice(basePrice);
        cartItem.setFinalPrice(finalPrice.multiply(BigDecimal.valueOf(quantity)));
        cartItem.setCustomizations(customizations);
        
        return cartItemRepository.save(cartItem);
    }
    
    /**
     * Get cart items for user
     */
    @Transactional(readOnly = true)
    public List<CartItem> getCartItems(UUID userId) {
        return cartItemRepository.findByUserId(userId);
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
                AddOn addOn = addOnRepository.findById(addOnId)
                        .orElseThrow(() -> new NotFoundException("Add-on not found"));
                if (addOn.getIsActive()) {
                    finalPrice = finalPrice.add(addOn.getPrice());
                }
            }
        }
        
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

