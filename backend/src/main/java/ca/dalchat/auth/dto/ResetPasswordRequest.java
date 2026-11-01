package ca.dalchat.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(

        @NotBlank(message = "Enter your email")
        String email,

        @NotBlank(message = "Your reset session has expired. Please start again.")
        String resetToken,

        @NotBlank(message = "Enter a password")
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*[0-9]).*$",
                message = "Include at least one uppercase letter and one number")
        String password
) {
}