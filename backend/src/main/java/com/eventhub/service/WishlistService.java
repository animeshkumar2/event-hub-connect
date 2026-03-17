package com.eventhub.service;

import com.eventhub.model.Listing;
import com.eventhub.model.WishlistItem;
import com.eventhub.repository.ListingRepository;
import com.eventhub.repository.WishlistItemRepository;
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
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ListingRepository listingRepository;

    @Transactional(readOnly = true)
    public List<WishlistItem> getWishlist(UUID userId) {
        return wishlistItemRepository.findByUserIdWithListing(userId);
    }

    public WishlistItem addToWishlist(UUID userId, UUID listingId) {
        if (wishlistItemRepository.existsByUserIdAndListingId(userId, listingId)) {
            throw new BusinessRuleException("Listing is already in your wishlist");
        }

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new NotFoundException("Listing not found"));

        WishlistItem item = new WishlistItem();
        item.setUserId(userId);
        item.setListing(listing);
        return wishlistItemRepository.save(item);
    }

    public void removeFromWishlist(UUID userId, UUID listingId) {
        wishlistItemRepository.deleteByUserIdAndListingId(userId, listingId);
    }

    @Transactional(readOnly = true)
    public boolean isWishlisted(UUID userId, UUID listingId) {
        return wishlistItemRepository.existsByUserIdAndListingId(userId, listingId);
    }

    @Transactional(readOnly = true)
    public long getWishlistCount(UUID userId) {
        return wishlistItemRepository.countByUserId(userId);
    }
}
