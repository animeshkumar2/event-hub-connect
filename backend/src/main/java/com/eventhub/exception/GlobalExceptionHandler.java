package com.eventhub.exception;

import com.eventhub.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFoundException(
            NotFoundException ex, 
            HttpServletRequest request) {
        log.warn("Resource not found: {} | Code: {} | URI: {} | Method: {}", 
                ex.getMessage(), 
                ex.getCode(),
                request.getRequestURI(),
                request.getMethod());
        log.debug("NotFoundException stack trace:", ex);
        
        ErrorResponse error = new ErrorResponse(ex.getCode(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(VendorProfileNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleVendorProfileNotFoundException(
            VendorProfileNotFoundException ex,
            HttpServletRequest request) {
        log.warn("Vendor profile not found: {} | Code: {} | URI: {} | Method: {}", 
                ex.getMessage(), 
                ex.getCode(),
                request.getRequestURI(),
                request.getMethod());
        log.debug("VendorProfileNotFoundException stack trace:", ex);
        
        ErrorResponse error = new ErrorResponse(ex.getCode(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            ValidationException ex,
            HttpServletRequest request) {
        log.warn("Validation error: {} | Code: {} | URI: {} | Method: {} | Validation errors: {}", 
                ex.getMessage(), 
                ex.getCode(),
                request.getRequestURI(),
                request.getMethod(),
                ex.getValidationErrors());
        log.debug("ValidationException stack trace:", ex);
        
        ErrorResponse error = new ErrorResponse(ex.getCode(), ex.getMessage());
        error.setValidationErrors(ex.getValidationErrors());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponse> handleAuthException(
            AuthException ex,
            HttpServletRequest request) {
        log.warn("Authentication error: {} | Code: {} | URI: {} | Method: {}", 
                ex.getUserMessage(), 
                ex.getErrorCode(),
                request.getRequestURI(),
                request.getMethod());
        log.debug("AuthException stack trace:", ex);
        
        ErrorResponse error = new ErrorResponse(ex.getErrorCode(), ex.getUserMessage());
        
        // Use 409 CONFLICT for email already exists, 401 UNAUTHORIZED for auth failures
        HttpStatus status = ex.getErrorCode().equals("EMAIL_ALREADY_EXISTS") 
            ? HttpStatus.CONFLICT 
            : HttpStatus.UNAUTHORIZED;
            
        return ResponseEntity.status(status).body(error);
    }
    
    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRuleException(
            BusinessRuleException ex,
            HttpServletRequest request) {
        log.warn("Business rule violation: {} | Code: {} | URI: {} | Method: {}", 
                ex.getMessage(), 
                ex.getCode(),
                request.getRequestURI(),
                request.getMethod());
        log.debug("BusinessRuleException stack trace:", ex);
        
        ErrorResponse error = new ErrorResponse(ex.getCode(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        log.warn("Method argument validation failed | URI: {} | Method: {} | Errors: {}", 
                request.getRequestURI(),
                request.getMethod(),
                errors);
        log.debug("MethodArgumentNotValidException stack trace:", ex);
        
        ErrorResponse error = new ErrorResponse("VALIDATION_ERROR", "Validation failed");
        error.setValidationErrors(errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {
        String exceptionType = ex.getClass().getName();
        String exceptionMessage = ex.getMessage();
        String causeInfo = null;
        
        if (ex.getCause() != null) {
            causeInfo = String.format("%s: %s", 
                    ex.getCause().getClass().getName(), 
                    ex.getCause().getMessage());
        }
        
        // Log detailed error information
        log.error("Unexpected exception occurred | Type: {} | Message: {} | URI: {} | Method: {} | Cause: {}", 
                exceptionType,
                exceptionMessage,
                request.getRequestURI(),
                request.getMethod(),
                causeInfo != null ? causeInfo : "N/A",
                ex); // Pass exception as last parameter to log full stack trace
        
        // Build error details for response
        StringBuilder detailsBuilder = new StringBuilder();
        if (exceptionMessage != null) {
            detailsBuilder.append(exceptionMessage);
        }
        if (causeInfo != null) {
            if (detailsBuilder.length() > 0) {
                detailsBuilder.append(" | Cause: ");
            }
            detailsBuilder.append(causeInfo);
        }
        detailsBuilder.append(" | Type: ").append(ex.getClass().getSimpleName());
        
        ErrorResponse error = new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred");
        error.setDetails(detailsBuilder.toString());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

