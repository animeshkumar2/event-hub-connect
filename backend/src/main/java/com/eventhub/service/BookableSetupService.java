package com.eventhub.service;

import com.eventhub.model.BookableSetup;
import com.eventhub.model.Vendor;
import com.eventhub.repository.BookableSetupRepository;
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
public class BookableSetupService {
    
    private final BookableSetupRepository bookableSetupRepository;
    private final VendorRepository vendorRepository;
    
    @Transactional(readOnly = true)
    public List<BookableSetup> getVendorSetups(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        return bookableSetupRepository.findByVendorAndIsActiveTrue(vendor);
    }
    
    public BookableSetup createSetup(UUID vendorId, BookableSetup setup) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        setup.setVendor(vendor);
        return bookableSetupRepository.save(setup);
    }
    
    public BookableSetup updateSetup(UUID setupId, UUID vendorId, BookableSetup updatedSetup) {
        BookableSetup setup = bookableSetupRepository.findById(setupId)
                .orElseThrow(() -> new NotFoundException("Bookable setup not found"));
        
        if (!setup.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to update this setup");
        }
        
        if (updatedSetup.getTitle() != null) {
            setup.setTitle(updatedSetup.getTitle());
        }
        if (updatedSetup.getDescription() != null) {
            setup.setDescription(updatedSetup.getDescription());
        }
        if (updatedSetup.getPrice() != null) {
            setup.setPrice(updatedSetup.getPrice());
        }
        if (updatedSetup.getImage() != null) {
            setup.setImage(updatedSetup.getImage());
        }
        if (updatedSetup.getIsActive() != null) {
            setup.setIsActive(updatedSetup.getIsActive());
        }
        
        return bookableSetupRepository.save(setup);
    }
    
    public void deleteSetup(UUID setupId, UUID vendorId) {
        BookableSetup setup = bookableSetupRepository.findById(setupId)
                .orElseThrow(() -> new NotFoundException("Bookable setup not found"));
        
        if (!setup.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to delete this setup");
        }
        
        bookableSetupRepository.delete(setup);
    }
}











