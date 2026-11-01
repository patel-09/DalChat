package ca.dalchat.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(

        @NotBlank(message = "Enter your first name")
        @Size(max = 40, message = "First name must be 40 characters or less")
        String firstName,

        @NotBlank(message = "Enter your last name")
        @Size(max = 40, message = "Last name must be 40 characters or less")
        String lastName,

        @NotBlank(message = "Enter your email")
        @Email(message = "Enter a valid email address")
        @Pattern(regexp = "(?i)^\\s*[^@\\s]+@dal\\.ca\\s*$", message = "Use your Dalhousie email (@dal.ca)")
        String email,

        @NotBlank(message = "Enter a password")
        @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*[0-9]).*$",
                message = "Include at least one uppercase letter and one number")
        String password
) {
}