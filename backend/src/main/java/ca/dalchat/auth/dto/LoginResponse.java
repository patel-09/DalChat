package ca.dalchat.auth.dto;

import ca.dalchat.user.UserResponse;

public record LoginResponse(String token, UserResponse user) {
}