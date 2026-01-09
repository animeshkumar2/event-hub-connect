package com.eventhub.service;

import com.eventhub.model.AvailabilitySlot;
import com.eventhub.model.Vendor;
import com.eventhub.repository.AvailabilitySlotRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorAvailabilityService {
    
    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final VendorRepository vendorRepository;
    
    @Transactional(readOnly = true)
    public List<AvailabilitySlot> getAvailability(UUID vendorId, LocalDate startDate, LocalDate endDate) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (endDate == null) {
            endDate = startDate.plusMonths(3);
        }
        
        return availabilitySlotRepository.findByVendorAndDateBetween(vendor, startDate, endDate);
    }
    
    public List<AvailabilitySlot> createAvailabilitySlots(UUID vendorId, LocalDate date, 
                                                          List<TimeSlotRequest> timeSlots) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        List<AvailabilitySlot> slots = timeSlots.stream()
                .map(ts -> {
                    AvailabilitySlot slot = new AvailabilitySlot();
                    slot.setVendor(vendor);
                    slot.setDate(date);
                    slot.setTimeSlot(ts.getTime());
                    slot.setStatus(AvailabilitySlot.SlotStatus.valueOf(ts.getStatus()));
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
    
    public void deleteSlot(UUID slotId, UUID vendorId) {
        AvailabilitySlot slot = availabilitySlotRepository.findById(slotId)
                .orElseThrow(() -> new NotFoundException("Availability slot not found"));
        
        if (!slot.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to delete this slot");
        }
        
        availabilitySlotRepository.delete(slot);
    }
    
    @lombok.Data
    public static class TimeSlotRequest {
        private String time;
        private String status;
    }
}











