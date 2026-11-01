package ca.dalchat.common;

import org.springframework.http.HttpStatus;

// Throw this anywhere to send an error reply with a status and message
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;   // optional, e.g. "EMAIL_NOT_VERIFIED"
    private final String field;  // optional, the form field it belongs to

    public ApiException(HttpStatus status, String message) {
        this(status, message, null, null);
    }

    public ApiException(HttpStatus status, String message, String code, String field) {
        super(message);
        this.status = status;
        this.code = code;
        this.field = field;
    }

    public HttpStatus getStatus() { return status; }
    public String getCode() { return code; }
    public String getField() { return field; }
}