package ca.dalchat.common;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Errors we throw on purpose (e.g. "email already exists")
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(new ErrorResponse(ex.getMessage(), ex.getCode(), ex.getField()));
    }

    // Input that broke a validation rule (e.g. not a @dal.ca email)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        FieldError first = ex.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);

        String message = first != null ? first.getDefaultMessage() : "Some details are invalid";
        String field = first != null ? first.getField() : null;

        return ResponseEntity.badRequest().body(new ErrorResponse(message, null, field));
    }
}