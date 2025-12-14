package com.eventhub.exception;

public class VendorProfileNotFoundException extends BaseException {
    public VendorProfileNotFoundException(String message) {
        super("VENDOR_PROFILE_NOT_FOUND", message);
    }
}




