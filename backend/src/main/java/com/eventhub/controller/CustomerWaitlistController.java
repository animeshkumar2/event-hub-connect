package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.dto.request.CustomerWaitlistRequest;
import com.eventhub.model.CustomerWaitlist;
import com.eventhub.service.CustomerWaitlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer-waitlist")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CustomerWaitlistController {
    
    private final CustomerWaitlistService customerWaitlistService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<CustomerWaitlist>> addToWaitlist(
            @Valid @RequestBody CustomerWaitlistRequest request) {
        log.info("Received waitlist request for email: {}", request.getEmail());
        
        CustomerWaitlist waitlist = customerWaitlistService.addToWaitlist(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Successfully added to waitlist", waitlist));
    }
}
