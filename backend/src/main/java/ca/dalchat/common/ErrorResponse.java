package ca.dalchat.common;

// The JSON body of every error reply
public record ErrorResponse(String message, String code, String field) {
}