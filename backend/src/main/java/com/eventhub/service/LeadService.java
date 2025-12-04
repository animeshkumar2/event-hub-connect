package com.eventhub.service;

import com.eventhub.dto.request.CreateLeadRequest;
import com.eventhub.model.Lead;
import com.eventhub.model.Vendor;
import com.eventhub.repository.LeadRepository;
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
public class LeadService {
    
    private final LeadRepository leadRepository;
    private final VendorRepository vendorRepository;
    
    public Lead createLead(CreateLeadRequest request) {
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        
        Lead lead = new Lead();
        lead.setVendor(vendor);
        lead.setUserId(request.getVendorId()); // Can be null for anonymous
        lead.setName(request.getName());
        lead.setEmail(request.getEmail());
        lead.setPhone(request.getPhone());
        lead.setEventType(request.getEventType());
        lead.setEventDate(request.getEventDate());
        lead.setVenueAddress(request.getVenueAddress());
        lead.setGuestCount(request.getGuestCount());
        lead.setBudget(request.getBudget());
        lead.setMessage(request.getMessage());
        lead.setStatus(Lead.LeadStatus.NEW);
        
        return leadRepository.save(lead);
    }
    
    @Transactional(readOnly = true)
    public List<Lead> getCustomerLeads(UUID userId) {
        return leadRepository.findByUserId(userId);
    }
    
    @Transactional(readOnly = true)
    public List<Lead> getVendorLeads(UUID vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new NotFoundException("Vendor not found"));
        return leadRepository.findByVendor(vendor, org.springframework.data.domain.Pageable.unpaged()).getContent();
    }
    
    public Lead updateLeadStatus(UUID leadId, Lead.LeadStatus status) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new NotFoundException("Lead not found"));
        lead.setStatus(status);
        return leadRepository.save(lead);
    }
}

