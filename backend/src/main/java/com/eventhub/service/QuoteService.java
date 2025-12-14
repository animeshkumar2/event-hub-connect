package com.eventhub.service;

import com.eventhub.model.Quote;
import com.eventhub.model.Lead;
import com.eventhub.repository.QuoteRepository;
import com.eventhub.repository.LeadRepository;
import com.eventhub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class QuoteService {
    
    private final QuoteRepository quoteRepository;
    private final LeadRepository leadRepository;
    
    public Quote createQuote(UUID leadId, UUID vendorId, Quote quote) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new NotFoundException("Lead not found"));
        
        if (!lead.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to create quote for this lead");
        }
        
        quote.setLead(lead);
        quote.setVendor(lead.getVendor());
        quote.setIsAccepted(false);
        
        // Update lead status to QUOTED
        lead.setStatus(com.eventhub.model.Lead.LeadStatus.QUOTED);
        leadRepository.save(lead);
        
        return quoteRepository.save(quote);
    }
    
    public Quote updateQuote(UUID quoteId, UUID vendorId, Quote updatedQuote) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        if (!quote.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to update this quote");
        }
        
        if (updatedQuote.getAmount() != null) {
            quote.setAmount(updatedQuote.getAmount());
        }
        if (updatedQuote.getDescription() != null) {
            quote.setDescription(updatedQuote.getDescription());
        }
        
        return quoteRepository.save(quote);
    }
    
    public void deleteQuote(UUID quoteId, UUID vendorId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        if (!quote.getVendor().getId().equals(vendorId)) {
            throw new com.eventhub.exception.BusinessRuleException("You don't have permission to delete this quote");
        }
        
        quoteRepository.delete(quote);
    }
    
    @Transactional(readOnly = true)
    public List<Quote> getLeadQuotes(UUID leadId) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new NotFoundException("Lead not found"));
        return quoteRepository.findByLead(lead);
    }
}





