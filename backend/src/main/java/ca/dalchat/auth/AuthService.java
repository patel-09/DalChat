package ca.dalchat.auth;

import java.time.Duration;
import java.util.Locale;

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
import ca.dalchat.common.ApiException;
import ca.dalchat.email.EmailSender;
import ca.dalchat.user.User;
import ca.dalchat.user.UserRepository;
import ca.dalchat.user.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Duration VERIFICATION_CODE_LIFETIME = Duration.ofMinutes(10);
    private static final Duration RESET_CODE_LIFETIME = Duration.ofMinutes(10);
    private static final Duration RESET_TOKEN_LIFETIME = Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OneTimeCodeService codeService;
    private final EmailSender emailSender;
    private final TokenService tokenService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       OneTimeCodeService codeService,
                       EmailSender emailSender,
                       TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.codeService = codeService;
        this.emailSender = emailSender;
        this.tokenService = tokenService;
    }

    // ---------- Sign up ----------

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "An account with this email already exists", null, "email");
        }

        User user = new User(
                request.firstName().trim(),
                request.lastName().trim(),
                email,
                passwordEncoder.encode(request.password()));
        userRepository.save(user);

        sendVerificationCode(user);

        return new SignupResponse(email, "Account created. Check your email for a verification code.");
    }

    // ---------- Verify email ----------

    @Transactional(noRollbackFor = ApiException.class)
    public MessageResponse verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));

        if (user.isEmailVerified()) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "This account is already verified. You can log in.");
        }

        codeService.verifyCode(user, CodePurpose.EMAIL_VERIFICATION, request.code());
        user.setEmailVerified(true);

        return new MessageResponse("Email verified");
    }

    // ---------- Resend code ----------

    @Transactional
    public MessageResponse resendVerificationCode(ResendCodeRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .filter(found -> !found.isEmailVerified())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                        "There is no unverified account for this email"));

        sendVerificationCode(user);

        return new MessageResponse("A new code has been sent");
    }

    // ---------- Log in ----------

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // Same message for "no such email" and "wrong password",
        // so attackers can't find out which emails have accounts
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .filter(found -> passwordEncoder.matches(request.password(), found.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect email or password"));

        if (!user.isEmailVerified()) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Please verify your email before logging in", "EMAIL_NOT_VERIFIED", null);
        }

        return new LoginResponse(tokenService.createToken(user), UserResponse.from(user));
    }

    // ---------- Forgot password: 1. send a code ----------

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(normalizeEmail(request.email())).ifPresent(user -> {
            String code = codeService.issueCode(user, CodePurpose.PASSWORD_RESET, RESET_CODE_LIFETIME);
            emailSender.send(user.getEmail(),
                    "Reset your DalChat password",
                    "Your DalChat password reset code is: " + code + "\n"
                            + "It expires in 10 minutes. If you didn't ask to reset your password, "
                            + "you can ignore this email.");
        });

        // Same answer whether or not the account exists,
        // so this can't be used to find out who has an account
        return new MessageResponse("If an account exists for this email, a reset code has been sent.");
    }

    // ---------- Forgot password: 2. check the code ----------

    @Transactional(noRollbackFor = ApiException.class)
    public VerifyResetCodeResponse verifyResetCode(VerifyResetCodeRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                        "This code is invalid or has expired. Request a new one."));

        codeService.verifyCode(user, CodePurpose.PASSWORD_RESET, request.code());

        String resetToken = codeService.issueToken(user, CodePurpose.PASSWORD_RESET_TOKEN, RESET_TOKEN_LIFETIME);
        return new VerifyResetCodeResponse(resetToken);
    }

    // ---------- Forgot password: 3. set the new password ----------

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(AuthService::resetSessionExpired);

        boolean tokenIsValid = codeService.consumeToken(
                user, CodePurpose.PASSWORD_RESET_TOKEN, request.resetToken());
        if (!tokenIsValid) {
            throw resetSessionExpired();
        }

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEmailVerified(true); // receiving the code proves they own this email

        return new MessageResponse("Password updated");
    }

    // ---------- Helpers ----------

    private void sendVerificationCode(User user) {
        String code = codeService.issueCode(user, CodePurpose.EMAIL_VERIFICATION, VERIFICATION_CODE_LIFETIME);
        emailSender.send(user.getEmail(),
                "Your DalChat verification code",
                "Your DalChat verification code is: " + code + "\nIt expires in 10 minutes.");
    }

    private static ApiException resetSessionExpired() {
        return new ApiException(HttpStatus.BAD_REQUEST,
                "Your reset session has expired. Please start again.", "RESET_SESSION_EXPIRED", null);
    }

    // "  Jane.Doe@DAL.ca " becomes "jane.doe@dal.ca"
    static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}