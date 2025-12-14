package com.eventhub.dto.request;

import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String credential; // The Google ID token
    private boolean isVendor;  // Whether this is a vendor signup
}




