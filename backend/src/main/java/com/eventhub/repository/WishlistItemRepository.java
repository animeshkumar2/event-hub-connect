package com.eventhub.repository;

import com.eventhub.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, UUID> {
    @Query("SELECT w FROM WishlistItem w LEFT JOIN FETCH w.listing l LEFT JOIN FETCH l.vendor WHERE w.userId = :userId ORDER BY w.createdAt DESC")
    List<WishlistItem> findByUserIdWithListing(@Param("userId") UUID userId);

    boolean existsByUserIdAndListingId(@Param("userId") UUID userId, @Param("listingId") UUID listingId);

    void deleteByUserIdAndListingId(UUID userId, UUID listingId);

    long countByUserId(UUID userId);
}
