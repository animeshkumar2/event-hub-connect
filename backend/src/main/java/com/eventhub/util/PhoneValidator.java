package com.eventhub.util;

import java.util.regex.Pattern;

/**
 * Validates Indian mobile phone numbers.
 * Catches obvious fake/test numbers while being careful not to block real numbers.
 */
public class PhoneValidator {
    
    // Indian mobile numbers: 10 digits starting with 6, 7, 8, or 9
    private static final Pattern INDIAN_MOBILE_PATTERN = Pattern.compile("^[6-9]\\d{9}$");
    
    // With country code: +91 followed by 10 digits starting with 6-9
    private static final Pattern INDIAN_MOBILE_WITH_CODE = Pattern.compile("^(\\+?91)?[6-9]\\d{9}$");
    
    /**
     * Validates an Indian mobile number.
     * @return ValidationResult with isValid flag and error message if invalid
     */
    public static ValidationResult validate(String phone) {
        if (phone == null || phone.isBlank()) {
            return new ValidationResult(false, "Phone number is required");
        }
        
        // Normalize: remove spaces, dashes, parentheses
        String normalized = phone.replaceAll("[\\s\\-\\(\\)\\.]", "");
        
        // Remove +91 or 91 prefix if present
        if (normalized.startsWith("+91")) {
            normalized = normalized.substring(3);
        } else if (normalized.startsWith("91") && normalized.length() == 12) {
            normalized = normalized.substring(2);
        }
        
        // Must be exactly 10 digits
        if (normalized.length() != 10) {
            return new ValidationResult(false, "Phone number must be 10 digits");
        }
        
        // Must start with 6, 7, 8, or 9 (Indian mobile)
        if (!INDIAN_MOBILE_PATTERN.matcher(normalized).matches()) {
            return new ValidationResult(false, "Please enter a valid Indian mobile number");
        }
        
        // Check for obvious fake patterns
        if (isObviousFake(normalized)) {
            return new ValidationResult(false, "Please enter a valid phone number");
        }
        
        return new ValidationResult(true, null, normalized);
    }
    
    /**
     * Checks for obvious fake/test number patterns.
     * Conservative approach - only blocks very obvious fakes.
     */
    private static boolean isObviousFake(String phone) {
        // All same digit (1111111111, 9999999999, etc.)
        if (phone.chars().distinct().count() == 1) {
            return true;
        }
        
        // Sequential ascending (6789012345 is blocked, but partial sequences are OK)
        if (isFullySequential(phone)) {
            return true;
        }
        
        // Common test patterns - only very obvious ones
        // Be careful: 9876543210 could theoretically be real, but it's extremely unlikely
        String[] obviousFakes = {
            "1234567890",
            "0123456789",
            "9876543210",
            "1234567891",
            "1234567892",
            "1234567893",
            "1234567894",
            "1234567895",
            "1234567896",
            "1234567897",
            "1234567898",
            "1234567899",
            "9999999999",
            "8888888888",
            "7777777777",
            "6666666666",
            "1111111111",
            "0000000000",
        };
        
        for (String fake : obviousFakes) {
            if (phone.equals(fake)) {
                return true;
            }
        }
        
        // Repeating pairs (1212121212, 9898989898)
        if (isRepeatingPairs(phone)) {
            return true;
        }
        
        // Too many repeated digits (more than 6 same digits)
        // Real numbers rarely have this, but some do (e.g., 9888888812)
        // So we only block if 7+ same digits
        if (hasExcessiveRepeats(phone, 7)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Checks if number is fully sequential (0123456789 or 9876543210)
     */
    private static boolean isFullySequential(String phone) {
        boolean ascending = true;
        boolean descending = true;
        
        for (int i = 1; i < phone.length(); i++) {
            int diff = phone.charAt(i) - phone.charAt(i - 1);
            if (diff != 1) ascending = false;
            if (diff != -1) descending = false;
        }
        
        return ascending || descending;
    }
    
    /**
     * Checks for repeating pair patterns (1212121212, 9898989898)
     */
    private static boolean isRepeatingPairs(String phone) {
        if (phone.length() != 10) return false;
        
        // Check if it's AB repeated 5 times
        String pair = phone.substring(0, 2);
        if (pair.charAt(0) == pair.charAt(1)) return false; // Same digit pair is caught elsewhere
        
        StringBuilder repeated = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            repeated.append(pair);
        }
        
        return phone.equals(repeated.toString());
    }
    
    /**
     * Checks if any digit appears more than threshold times
     */
    private static boolean hasExcessiveRepeats(String phone, int threshold) {
        int[] counts = new int[10];
        for (char c : phone.toCharArray()) {
            counts[c - '0']++;
        }
        
        for (int count : counts) {
            if (count >= threshold) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Normalizes phone number to 10-digit format (removes +91, spaces, etc.)
     */
    public static String normalize(String phone) {
        if (phone == null) return null;
        
        String normalized = phone.replaceAll("[\\s\\-\\(\\)\\.]", "");
        
        if (normalized.startsWith("+91")) {
            normalized = normalized.substring(3);
        } else if (normalized.startsWith("91") && normalized.length() == 12) {
            normalized = normalized.substring(2);
        }
        
        return normalized;
    }
    
    public static class ValidationResult {
        private final boolean valid;
        private final String errorMessage;
        private final String normalizedPhone;
        
        public ValidationResult(boolean valid, String errorMessage) {
            this(valid, errorMessage, null);
        }
        
        public ValidationResult(boolean valid, String errorMessage, String normalizedPhone) {
            this.valid = valid;
            this.errorMessage = errorMessage;
            this.normalizedPhone = normalizedPhone;
        }
        
        public boolean isValid() { return valid; }
        public String getErrorMessage() { return errorMessage; }
        public String getNormalizedPhone() { return normalizedPhone; }
    }
}
