package ca.dalchat.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record ResendCodeRequest(

        @NotBlank(message = "Enter your email")
        String email
) {
}