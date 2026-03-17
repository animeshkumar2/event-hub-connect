package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.WishlistItem;
import com.eventhub.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistItem>>> getWishlist(@RequestHeader("X-User-Id") UUID userId) {
        List<WishlistItem> items = wishlistService.getWishlist(userId);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WishlistItem>> addToWishlist(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Map<String, String> body) {
        UUID listingId = UUID.fromString(body.get("listingId"));
        WishlistItem item = wishlistService.addToWishlist(userId, listingId);
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist", item));
    }

    @DeleteMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID listingId) {
        wishlistService.removeFromWishlist(userId, listingId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }

    @GetMapping("/check/{listingId}")
    public ResponseEntity<ApiResponse<Boolean>> isWishlisted(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID listingId) {
        boolean wishlisted = wishlistService.isWishlisted(userId, listingId);
        return ResponseEntity.ok(ApiResponse.success(wishlisted));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getWishlistCount(@RequestHeader("X-User-Id") UUID userId) {
        long count = wishlistService.getWishlistCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
