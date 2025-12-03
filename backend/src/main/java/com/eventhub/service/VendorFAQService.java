package com.eventhub.service;

import com.eventhub.model.VendorFAQ;
import com.eventhub.model.Vendor;
import com.eventhub.repository.VendorFAQRepository;
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
public class VendorFAQService {
    
    private final VendorFAQRepository vendorFAQRepository;
    private final VendorRepository vendorRepository;
    
    @Transactional(readOnly = true)
    public List<VendorFAQ> getFAQs(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        return vendorFAQRepository.findByVendorOrderByDisplayOrderAsc(vendor);
    }
    
    public VendorFAQ createFAQ(UUID vendorId, VendorFAQ faq) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        faq.setVendor(vendor);
        return vendorFAQRepository.save(faq);
    }
    
    public VendorFAQ updateFAQ(UUID faqId, UUID vendorId, VendorFAQ updatedFAQ) {
        VendorFAQ faq = vendorFAQRepository.findById(faqId)
                .orElseThrow(() -> new NotFoundException("FAQ not found"));
        
        if (!faq.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to update this FAQ");
        }
        
        if (updatedFAQ.getQuestion() != null) {
            faq.setQuestion(updatedFAQ.getQuestion());
        }
        if (updatedFAQ.getAnswer() != null) {
            faq.setAnswer(updatedFAQ.getAnswer());
        }
        if (updatedFAQ.getDisplayOrder() != null) {
            faq.setDisplayOrder(updatedFAQ.getDisplayOrder());
        }
        
        return vendorFAQRepository.save(faq);
    }
    
    public void deleteFAQ(UUID faqId, UUID vendorId) {
        VendorFAQ faq = vendorFAQRepository.findById(faqId)
                .orElseThrow(() -> new NotFoundException("FAQ not found"));
        
        if (!faq.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to delete this FAQ");
        }
        
        vendorFAQRepository.delete(faq);
    }
}

