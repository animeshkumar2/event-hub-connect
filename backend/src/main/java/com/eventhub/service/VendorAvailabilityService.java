package com.eventhub.service;

import com.eventhub.model.AvailabilitySlot;
import com.eventhub.model.Vendor;
import com.eventhub.repository.AvailabilitySlotRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class VendorAvailabilityService {
    
    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final VendorRepository vendorRepository;
    
    // Default time slots for category-wise booking
    private static final String[] DEFAULT_TIME_SLOTS = {"MORNING", "AFTERNOON", "EVENING"};
    
    @Transactional(readOnly = true)
    public List<AvailabilitySlot> getAvailability(UUID vendorId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (endDate == null) {
            endDate = startDate.plusMonths(3);
        }
        return availabilitySlotRepository.findByVendorIdAndDateBetween(vendorId, startDate, endDate);
    }
    
    @Transactional(readOnly = true)
    public List<AvailabilitySlot> getAvailabilityByCategory(UUID vendorId, LocalDate startDate, LocalDate endDate, String categoryId) {
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (endDate == null) {
            endDate = startDate.plusMonths(3);
        }
        return availabilitySlotRepository.findByVendorIdAndDateBetweenAndCategory(vendorId, startDate, endDate, categoryId);
    }
    
    @Transactional(readOnly = true)
    public List<AvailabilitySlot> getDayDetails(UUID vendorId, LocalDate date) {
        return availabilitySlotRepository.findByVendorIdAndDate(vendorId, date);
    }
    
    @Transactional(readOnly = true)
    public Map<String, Map<String, Long>> getBookingCountsByDateAndCategory(UUID vendorId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = availabilitySlotRepository.countBookingsByDateAndCategory(vendorId, startDate, endDate);
        Map<String, Map<String, Long>> counts = new HashMap<>();
        
        for (Object[] row : results) {
            LocalDate date = (LocalDate) row[0];
            String categoryId = (String) row[1];
            Long count = (Long) row[2];
            
            String dateStr = date.toString();
            counts.computeIfAbsent(dateStr, k -> new HashMap<>())
                  .put(categoryId != null ? categoryId : "all", count);
        }
        return counts;
    }
    
    public List<AvailabilitySlot> createAvailabilitySlots(UUID vendorId, LocalDate date, List<TimeSlotRequest> timeSlots) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        List<AvailabilitySlot> slots = timeSlots.stream()
                .map(ts -> {
                    AvailabilitySlot slot = new AvailabilitySlot();
                    slot.setVendor(vendor);
                    slot.setDate(date);
                    slot.setTimeSlot(ts.getTime());
                    slot.setStatus(AvailabilitySlot.SlotStatus.valueOf(ts.getStatus()));
                    slot.setCategoryId(ts.getCategoryId());
                    if (ts.getTimeSlotType() != null) {
                        slot.setTimeSlotType(AvailabilitySlot.TimeSlotType.valueOf(ts.getTimeSlotType()));
                    }
                    return slot;
                })
                .toList();
        
        return availabilitySlotRepository.saveAll(slots);
    }
    
    public AvailabilitySlot updateSlot(UUID slotId, UUID vendorId, AvailabilitySlot.SlotStatus status) {
        AvailabilitySlot slot = availabilitySlotRepository.findById(slotId)
                .orElseThrow(() -> new NotFoundException("Availability slot not found"));
        
        if (!slot.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to update this slot");
        }
        
        slot.setStatus(status);
        return availabilitySlotRepository.save(slot);
    }
    
    public AvailabilitySlot updateSlotWithDetails(UUID slotId, UUID vendorId, SlotUpdateRequest request) {
        AvailabilitySlot slot = availabilitySlotRepository.findById(slotId)
                .orElseThrow(() -> new NotFoundException("Availability slot not found"));
        
        if (!slot.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to update this slot");
        }
        
        if (request.getStatus() != null) {
            slot.setStatus(AvailabilitySlot.SlotStatus.valueOf(request.getStatus()));
        }
        if (request.getNotes() != null) {
            slot.setNotes(request.getNotes());
        }
        if (request.getTimeSlotType() != null) {
            slot.setTimeSlotType(AvailabilitySlot.TimeSlotType.valueOf(request.getTimeSlotType()));
        }
        
        return availabilitySlotRepository.save(slot);
    }
    
    public void deleteSlot(UUID slotId, UUID vendorId) {
        AvailabilitySlot slot = availabilitySlotRepository.findById(slotId)
                .orElseThrow(() -> new NotFoundException("Availability slot not found"));
        
        if (!slot.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to delete this slot");
        }
        
        availabilitySlotRepository.delete(slot);
    }
    
    public int bulkUpdateAvailability(UUID vendorId, LocalDate startDate, LocalDate endDate, 
                                      AvailabilitySlot.SlotStatus status, String categoryId, String notes) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        // Validate date range (max 90 days)
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (daysBetween > 90) {
            throw new com.eventhub.exception.BusinessRuleException(
                    "Cannot update more than 90 days at once. Selected: " + daysBetween + " days");
        }
        
        int updatedCount = 0;
        LocalDate current = startDate;
        
        while (!current.isAfter(endDate)) {
            updatedCount += updateOrCreateSlotsForDay(vendor, current, status, categoryId, notes);
            current = current.plusDays(1);
        }
        
        return updatedCount;
    }
    
    private int updateOrCreateSlotsForDay(Vendor vendor, LocalDate date, AvailabilitySlot.SlotStatus status, 
                                          String categoryId, String notes) {
        int count = 0;
        
        // If category is specified, update/create slots for that category only
        if (categoryId != null && !categoryId.isEmpty() && !categoryId.trim().isEmpty()) {
            for (String timeSlot : DEFAULT_TIME_SLOTS) {
                try {
                    Optional<AvailabilitySlot> existing = availabilitySlotRepository
                            .findByVendorAndDateAndTimeSlotAndCategory(vendor, date, timeSlot, categoryId);
                    
                    if (existing.isPresent()) {
                        AvailabilitySlot slot = existing.get();
                        if (slot.getStatus() != status) {
                            slot.setStatus(status);
                            slot.setNotes(notes);
                            availabilitySlotRepository.save(slot);
                            count++;
                        }
                    } else {
                        AvailabilitySlot slot = new AvailabilitySlot();
                        slot.setVendor(vendor);
                        slot.setDate(date);
                        slot.setTimeSlot(timeSlot);
                        slot.setStatus(status);
                        slot.setCategoryId(categoryId);
                        // Safely convert timeSlot string to enum
                        try {
                            slot.setTimeSlotType(AvailabilitySlot.TimeSlotType.valueOf(timeSlot));
                        } catch (IllegalArgumentException e) {
                            // Fallback to FULL_DAY if enum conversion fails
                            slot.setTimeSlotType(AvailabilitySlot.TimeSlotType.FULL_DAY);
                        }
                        slot.setNotes(notes);
                        availabilitySlotRepository.save(slot);
                        count++;
                    }
                } catch (Exception e) {
                    // Log error but continue with other time slots
                    log.error("Error processing time slot {} for category {}: {}", timeSlot, categoryId, e.getMessage());
                }
            }
        } else {
            // Block/Unblock all categories for this vendor
            // Get all listing category IDs for this vendor
            List<String> vendorCategoryIds = new java.util.ArrayList<>();
            
            // Add vendor's main category if available
            if (vendor.getVendorCategory() != null) {
                vendorCategoryIds.add(vendor.getVendorCategory().getId());
            }
            
            // Add all listing categories from vendor's active listings
            List<com.eventhub.model.Listing> listings = vendor.getListings();
            if (listings != null) {
                for (com.eventhub.model.Listing listing : listings) {
                    if (listing.getListingCategory() != null && 
                        listing.getIsActive() != null && listing.getIsActive() &&
                        (listing.getIsDraft() == null || !listing.getIsDraft())) {
                        String listingCatId = listing.getListingCategory().getId();
                        if (!vendorCategoryIds.contains(listingCatId)) {
                            vendorCategoryIds.add(listingCatId);
                        }
                    }
                }
            }
            
            // If no categories found, create slots without category (fallback)
            if (vendorCategoryIds.isEmpty()) {
                vendorCategoryIds.add(null);
            }
            
            // Create/update slots for each category and each time slot
            for (String catId : vendorCategoryIds) {
                for (String timeSlot : DEFAULT_TIME_SLOTS) {
                    try {
                        Optional<AvailabilitySlot> existing = availabilitySlotRepository
                                .findByVendorAndDateAndTimeSlotAndCategory(vendor, date, timeSlot, catId);
                        
                        if (existing.isPresent()) {
                            AvailabilitySlot slot = existing.get();
                            if (slot.getStatus() != status) {
                                slot.setStatus(status);
                                slot.setNotes(notes);
                                availabilitySlotRepository.save(slot);
                                count++;
                            }
                        } else if (status == AvailabilitySlot.SlotStatus.BLOCKED) {
                            // Only create new slots when blocking (not when unblocking)
                            AvailabilitySlot slot = new AvailabilitySlot();
                            slot.setVendor(vendor);
                            slot.setDate(date);
                            slot.setTimeSlot(timeSlot);
                            slot.setStatus(status);
                            slot.setCategoryId(catId);
                            try {
                                slot.setTimeSlotType(AvailabilitySlot.TimeSlotType.valueOf(timeSlot));
                            } catch (IllegalArgumentException e) {
                                slot.setTimeSlotType(AvailabilitySlot.TimeSlotType.FULL_DAY);
                            }
                            slot.setNotes(notes);
                            availabilitySlotRepository.save(slot);
                            count++;
                        }
                    } catch (Exception e) {
                        log.error("Error processing time slot {} for category {}: {}", timeSlot, catId, e.getMessage());
                    }
                }
            }
        }
        
        return count;
    }
    
    public int blockDayForCategory(UUID vendorId, LocalDate date, String categoryId, String notes) {
        return bulkUpdateAvailability(vendorId, date, date, AvailabilitySlot.SlotStatus.BLOCKED, categoryId, notes);
    }
    
    public int unblockDayForCategory(UUID vendorId, LocalDate date, String categoryId) {
        return bulkUpdateAvailability(vendorId, date, date, AvailabilitySlot.SlotStatus.AVAILABLE, categoryId, null);
    }
    
    public int blockDay(UUID vendorId, LocalDate date) {
        return blockDayForCategory(vendorId, date, null, null);
    }
    
    public int unblockDay(UUID vendorId, LocalDate date) {
        return unblockDayForCategory(vendorId, date, null);
    }
    
    /**
     * Block a specific time slot for a category
     */
    public int blockTimeSlot(UUID vendorId, LocalDate date, String timeSlotType, String categoryId, String notes) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        // Find or create the specific time slot
        Optional<AvailabilitySlot> existing = availabilitySlotRepository
                .findByVendorAndDateAndTimeSlotAndCategory(vendor, date, timeSlotType, categoryId);
        
        if (existing.isPresent()) {
            AvailabilitySlot slot = existing.get();
            if (slot.getStatus() != AvailabilitySlot.SlotStatus.BLOCKED) {
                slot.setStatus(AvailabilitySlot.SlotStatus.BLOCKED);
                slot.setNotes(notes);
                availabilitySlotRepository.save(slot);
                return 1;
            }
            return 0;
        } else {
            // Create new blocked slot
            AvailabilitySlot slot = new AvailabilitySlot();
            slot.setVendor(vendor);
            slot.setDate(date);
            slot.setTimeSlot(timeSlotType);
            slot.setStatus(AvailabilitySlot.SlotStatus.BLOCKED);
            slot.setCategoryId(categoryId);
            slot.setNotes(notes);
            try {
                slot.setTimeSlotType(AvailabilitySlot.TimeSlotType.valueOf(timeSlotType));
            } catch (IllegalArgumentException e) {
                // Custom time slot, set to FULL_DAY or handle custom format
                slot.setTimeSlotType(AvailabilitySlot.TimeSlotType.FULL_DAY);
            }
            availabilitySlotRepository.save(slot);
            return 1;
        }
    }
    
    /**
     * Unblock a specific time slot for a category
     */
    public int unblockTimeSlot(UUID vendorId, LocalDate date, String timeSlotType, String categoryId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        Optional<AvailabilitySlot> existing = availabilitySlotRepository
                .findByVendorAndDateAndTimeSlotAndCategory(vendor, date, timeSlotType, categoryId);
        
        if (existing.isPresent()) {
            AvailabilitySlot slot = existing.get();
            if (slot.getStatus() == AvailabilitySlot.SlotStatus.BLOCKED) {
                slot.setStatus(AvailabilitySlot.SlotStatus.AVAILABLE);
                availabilitySlotRepository.save(slot);
                return 1;
            }
            return 0;
        }
        return 0;
    }
    
    /**
     * Block a custom time range (from-to)
     */
    public int blockCustomTimeRange(UUID vendorId, LocalDate date, String fromTime, String toTime, String categoryId, String notes) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        // Create a custom time slot identifier
        String timeSlotKey = fromTime + "-" + toTime;
        
        Optional<AvailabilitySlot> existing = availabilitySlotRepository
                .findByVendorAndDateAndTimeSlotAndCategory(vendor, date, timeSlotKey, categoryId);
        
        if (existing.isPresent()) {
            AvailabilitySlot slot = existing.get();
            if (slot.getStatus() != AvailabilitySlot.SlotStatus.BLOCKED) {
                slot.setStatus(AvailabilitySlot.SlotStatus.BLOCKED);
                slot.setNotes(notes);
                availabilitySlotRepository.save(slot);
                return 1;
            }
            return 0;
        } else {
            AvailabilitySlot slot = new AvailabilitySlot();
            slot.setVendor(vendor);
            slot.setDate(date);
            slot.setTimeSlot(timeSlotKey);
            slot.setStatus(AvailabilitySlot.SlotStatus.BLOCKED);
            slot.setCategoryId(categoryId);
            slot.setNotes(notes);
            slot.setTimeSlotType(AvailabilitySlot.TimeSlotType.FULL_DAY);
            availabilitySlotRepository.save(slot);
            return 1;
        }
    }
    
    @lombok.Data
    public static class TimeSlotRequest {
        private String time;
        private String status;
        private String categoryId;
        private String timeSlotType;
    }
    
    @lombok.Data
    public static class SlotUpdateRequest {
        private String status;
        private String notes;
        private String timeSlotType;
    }
}
