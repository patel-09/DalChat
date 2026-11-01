package ca.dalchat.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(

        @NotBlank(message = "Enter your email")
        String email
) {
}