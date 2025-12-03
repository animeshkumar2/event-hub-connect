package com.eventhub.exception;

public class BusinessRuleException extends BaseException {
    public BusinessRuleException(String message) {
        super("BUSINESS_RULE_VIOLATION", message);
    }
}

