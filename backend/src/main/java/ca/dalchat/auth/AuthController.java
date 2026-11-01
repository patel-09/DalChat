package ca.dalchat.auth;

import ca.dalchat.auth.dto.ForgotPasswordRequest;
import ca.dalchat.auth.dto.LoginRequest;
import ca.dalchat.auth.dto.LoginResponse;
import ca.dalchat.auth.dto.MessageResponse;
import ca.dalchat.auth.dto.ResendCodeRequest;
import ca.dalchat.auth.dto.ResetPasswordRequest;
import ca.dalchat.auth.dto.SignupRequest;
import ca.dalchat.auth.dto.SignupResponse;
import ca.dalchat.auth.dto.VerifyEmailRequest;
import ca.dalchat.auth.dto.VerifyResetCodeRequest;
import ca.dalchat.auth.dto.VerifyResetCodeResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public SignupResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/verify-email")
    public MessageResponse verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return authService.verifyEmail(request);
    }

    @PostMapping("/resend-code")
    public MessageResponse resendCode(@Valid @RequestBody ResendCodeRequest request) {
        return authService.resendVerificationCode(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/verify-reset-code")
    public VerifyResetCodeResponse verifyResetCode(@Valid @RequestBody VerifyResetCodeRequest request) {
        return authService.verifyResetCode(request);
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }
}