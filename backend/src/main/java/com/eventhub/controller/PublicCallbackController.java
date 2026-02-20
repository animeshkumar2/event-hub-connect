package com.eventhub.controller;

import com.eventhub.dto.ApiResponse;
import com.eventhub.model.CallbackRequest;
import com.eventhub.service.CallbackRequestService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/public/callback-request")
@RequiredArgsConstructor
public class PublicCallbackController {
    
    private final CallbackRequestService callbackRequestService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<CallbackRequest>> submitCallbackRequest(
            @Valid @RequestBody CallbackRequestDTO request) {
        CallbackRequest saved = callbackRequestService.createCallbackRequest(request);
        return ResponseEntity.ok(ApiResponse.success("Callback request submitted successfully", saved));
    }
    
    @Data
    public static class CallbackRequestDTO {
        @NotBlank(message = "Name is required")
        private String name;
        
        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid mobile number")
        private String mobile;
        
        private LocalDate eventDate;
        private Boolean dateFlexible;
        private String requirement;
        
        private String listingId;
        private String listingName;
        private String vendorId;
        private String vendorName;
        private String category;
    }
}
