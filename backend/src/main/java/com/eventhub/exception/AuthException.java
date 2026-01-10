package com.eventhub.exception;

import lombok.Getter;

@Getter
public class AuthException extends RuntimeException {
    private final String errorCode;
    private final String userMessage;
    
    public AuthException(String errorCode, String userMessage) {
        super(userMessage);
        this.errorCode = errorCode;
        this.userMessage = userMessage;
    }
    
    // Predefined error codes for better frontend handling
    public static final String EMAIL_NOT_FOUND = "EMAIL_NOT_FOUND";
    public static final String INVALID_PASSWORD = "INVALID_PASSWORD";
    public static final String EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS";
    public static final String WEAK_PASSWORD = "WEAK_PASSWORD";
    public static final String INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT";
    public static final String ACCOUNT_LOCKED = "ACCOUNT_LOCKED";
    public static final String GOOGLE_AUTH_FAILED = "GOOGLE_AUTH_FAILED";
    public static final String TOKEN_EXPIRED = "TOKEN_EXPIRED";
    public static final String INVALID_TOKEN = "INVALID_TOKEN";
}
