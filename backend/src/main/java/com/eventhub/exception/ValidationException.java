package com.eventhub.exception;

import java.util.Map;

public class ValidationException extends BaseException {
    private final Map<String, String> validationErrors;
    
    public ValidationException(String message) {
        super("VALIDATION_ERROR", message);
        this.validationErrors = null;
    }
    
    public ValidationException(String message, Map<String, String> validationErrors) {
        super("VALIDATION_ERROR", message);
        this.validationErrors = validationErrors;
    }
    
    public Map<String, String> getValidationErrors() {
        return validationErrors;
    }
}

