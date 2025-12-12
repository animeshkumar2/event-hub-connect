package com.eventhub.repository;

import com.eventhub.model.AddOn;
import com.eventhub.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AddOnRepository extends JpaRepository<AddOn, UUID> {
    List<AddOn> findByPackageListingAndIsActiveTrue(Listing packageListing);
    List<AddOn> findByPackageListing(Listing packageListing);
}


