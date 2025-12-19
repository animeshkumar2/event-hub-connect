package com.eventhub.repository;

import com.eventhub.model.AvailabilitySlot;
import com.eventhub.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, UUID> {
    List<AvailabilitySlot> findByVendorAndDateBetween(Vendor vendor, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT a FROM AvailabilitySlot a WHERE a.vendor = :vendor AND a.date = :date AND a.timeSlot = :timeSlot")
    Optional<AvailabilitySlot> findByVendorAndDateAndTimeSlot(
        @Param("vendor") Vendor vendor,
        @Param("date") LocalDate date,
        @Param("timeSlot") String timeSlot
    );
    
    List<AvailabilitySlot> findByVendorAndDateAndStatus(Vendor vendor, LocalDate date, AvailabilitySlot.SlotStatus status);
}









