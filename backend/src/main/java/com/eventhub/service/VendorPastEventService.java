package com.eventhub.service;

import com.eventhub.model.VendorPastEvent;
import com.eventhub.model.Vendor;
import com.eventhub.repository.VendorPastEventRepository;
import com.eventhub.repository.VendorRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorPastEventService {
    
    private final VendorPastEventRepository pastEventRepository;
    private final VendorRepository vendorRepository;
    
    @Transactional(readOnly = true)
    public List<VendorPastEvent> getPastEvents(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        return pastEventRepository.findByVendorOrderByEventDateDesc(vendor);
    }
    
    public VendorPastEvent addPastEvent(UUID vendorId, VendorPastEvent event) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        event.setVendor(vendor);
        return pastEventRepository.save(event);
    }
    
    public void deletePastEvent(UUID eventId, UUID vendorId) {
        VendorPastEvent event = pastEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Past event not found"));
        
        if (!event.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to delete this event");
        }
        
        pastEventRepository.delete(event);
    }
}


