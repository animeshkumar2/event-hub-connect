package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.CartSummaryDTO;
import com.eventhub.model.CartItem;
import com.eventhub.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers/cart")
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<CartItem>>> getCart(@RequestHeader("X-User-Id") UUID userId) {
        List<CartItem> items = cartService.getCartItems(userId);
        return ResponseEntity.ok(ApiResponse.success(items));
    }
    
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartItem>> addToCart(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody AddToCartRequest request) {
        CartItem item = cartService.addToCart(
                userId,
                request.getListingId(),
                request.getQuantity(),
                request.getAddOnIds(),
                request.getCustomizations()
        );
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", item));
    }
    
    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartItem>> updateCartItem(
            @PathVariable UUID itemId,
            @RequestBody UpdateCartItemRequest request) {
        CartItem item = cartService.updateCartItem(
                itemId,
                request.getQuantity(),
                request.getAddOnIds(),
                request.getCustomizations()
        );
        return ResponseEntity.ok(ApiResponse.success("Cart item updated", item));
    }
    
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(@PathVariable UUID itemId) {
        cartService.removeFromCart(itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", null));
    }
    
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@RequestHeader("X-User-Id") UUID userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
    
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<CartSummaryDTO>> getCartSummary(@RequestHeader("X-User-Id") UUID userId) {
        CartService.CartSummary summary = cartService.calculateCartSummary(userId);
        CartSummaryDTO dto = new CartSummaryDTO(
                summary.getSubtotal(),
                summary.getPlatformFee(),
                summary.getGst(),
                summary.getTotal()
        );
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
    
    // Request DTOs (should be in separate files, but included here for brevity)
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class AddToCartRequest {
        private UUID listingId;
        private Integer quantity = 1;
        private List<UUID> addOnIds;
        private Map<String, Object> customizations;
    }
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class UpdateCartItemRequest {
        private Integer quantity;
        private List<UUID> addOnIds;
        private Map<String, Object> customizations;
    }
}

