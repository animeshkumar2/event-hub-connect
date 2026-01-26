package com.eventhub.repository;

import com.eventhub.model.PackageItem;
import com.eventhub.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PackageItemRepository extends JpaRepository<PackageItem, UUID> {
    List<PackageItem> findByPackageListingOrderByDisplayOrderAsc(Listing packageListing);
    List<PackageItem> findByItemListing(Listing itemListing);
    
    // Count packages that contain this item (for delete validation)
    long countByItemListing(Listing itemListing);
    
    // Find active packages containing this item
    @org.springframework.data.jpa.repository.Query(
        "SELECT pi FROM PackageItem pi WHERE pi.itemListing.id = :itemId AND pi.packageListing.isActive = true"
    )
    List<PackageItem> findActivePackagesContainingItem(@org.springframework.data.repository.query.Param("itemId") UUID itemId);
}











