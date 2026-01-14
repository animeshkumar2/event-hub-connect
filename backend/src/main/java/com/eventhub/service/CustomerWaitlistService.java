package com.eventhub.service;

import com.eventhub.dto.request.CustomerWaitlistRequest;
import com.eventhub.exception.ValidationException;
import com.eventhub.model.CustomerWaitlist;
import com.eventhub.repository.CustomerWaitlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerWaitlistService {
    
    private final CustomerWaitlistRepository customerWaitlistRepository;
    
    @Transactional
    public CustomerWaitlist addToWaitlist(CustomerWaitlistRequest request) {
        log.info("Adding customer to waitlist: {}", request.getEmail());
        
        // Check if email already exists
        if (customerWaitlistRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("This email is already on the waitlist");
        }
        
        // Create new waitlist entry
        CustomerWaitlist waitlist = new CustomerWaitlist();
        waitlist.setName(request.getName());
        waitlist.setEmail(request.getEmail());
        waitlist.setPhone(request.getPhone());
        waitlist.setNotified(false);
        
        CustomerWaitlist saved = customerWaitlistRepository.save(waitlist);
        log.info("Customer added to waitlist successfully: {}", saved.getId());
        
        return saved;
    }
}
