package com.eventhub.exception;

public class NotFoundException extends BaseException {
    public NotFoundException(String message) {
        super("NOT_FOUND", message);
    }
}











