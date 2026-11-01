package ca.dalchat.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyEmailRequest(

        @NotBlank(message = "Enter your email")
        String email,

        @NotBlank(message = "Enter the code")
        @Pattern(regexp = "^\\d{5}$", message = "The code must be 5 digits")
        String code
) {
}