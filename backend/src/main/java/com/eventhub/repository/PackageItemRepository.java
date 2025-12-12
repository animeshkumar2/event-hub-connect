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
}


