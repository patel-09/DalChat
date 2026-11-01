package ca.dalchat.auth;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;

import ca.dalchat.common.ApiException;
import ca.dalchat.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OneTimeCodeService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MAX_ATTEMPTS = 5;

    private final OneTimeCodeRepository codeRepository;
    private final PasswordEncoder passwordEncoder;

    public OneTimeCodeService(OneTimeCodeRepository codeRepository, PasswordEncoder passwordEncoder) {
        this.codeRepository = codeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Creates a new 5-digit code (replacing older ones) and returns it so it can be emailed. */
    @Transactional
    public String issueCode(User user, CodePurpose purpose, Duration lifetime) {
        String code = String.valueOf(10000 + RANDOM.nextInt(90000)); // 10000 to 99999
        save(user, purpose, code, lifetime);
        return code;
    }

    /** Creates a long random token that's impossible to guess (used after a correct reset code). */
    @Transactional
    public String issueToken(User user, CodePurpose purpose, Duration lifetime) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        save(user, purpose, token, lifetime);
        return token;
    }

    /** Checks a typed code. Throws if wrong, expired or locked; otherwise marks it used. */
    @Transactional(noRollbackFor = ApiException.class)
    public void verifyCode(User user, CodePurpose purpose, String submittedCode) {
        OneTimeCode code = codeRepository
                .findFirstByUserAndPurposeAndUsedAtIsNullOrderByIdDesc(user, purpose)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                        "This code is invalid or has expired. Request a new one."));

        if (code.isExpired()) {
            throw new ApiException(HttpStatus.GONE, "This code has expired. Request a new one.");
        }

        if (code.getAttempts() >= MAX_ATTEMPTS) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many wrong attempts. Request a new code.");
        }

        if (!passwordEncoder.matches(submittedCode, code.getCodeHash())) {
            code.recordFailedAttempt(); // saved automatically when the method ends
            throw new ApiException(HttpStatus.BAD_REQUEST, "Incorrect code. Please try again.");
        }

        code.markUsed();
    }

    /** Uses up a token if it's valid. Returns false if it's missing, wrong or expired. */
    @Transactional
    public boolean consumeToken(User user, CodePurpose purpose, String submittedToken) {
        return codeRepository
                .findFirstByUserAndPurposeAndUsedAtIsNullOrderByIdDesc(user, purpose)
                .filter(token -> !token.isExpired())
                .filter(token -> passwordEncoder.matches(submittedToken, token.getCodeHash()))
                .map(token -> {
                    token.markUsed();
                    return true;
                })
                .orElse(false);
    }

    // Deletes older entries of the same purpose, then saves the new one (hashed)
    private void save(User user, CodePurpose purpose, String plainValue, Duration lifetime) {
        codeRepository.deleteByUserAndPurpose(user, purpose);
        codeRepository.save(new OneTimeCode(
                user, purpose, passwordEncoder.encode(plainValue), LocalDateTime.now().plus(lifetime)));
    }
}