package ca.dalchat.auth;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;

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

    /**
     * Creates a new 5-digit code, replacing any older code with the same purpose.
     * Only the hash is saved; the plain code is returned so it can be emailed.
     */
    @Transactional
    public String issueCode(User user, CodePurpose purpose, Duration lifetime) {
        codeRepository.deleteByUserAndPurpose(user, purpose);

        String code = String.valueOf(10000 + RANDOM.nextInt(90000)); // 10000 to 99999
        String codeHash = passwordEncoder.encode(code);

        codeRepository.save(new OneTimeCode(user, purpose, codeHash, LocalDateTime.now().plus(lifetime)));
        return code;
    }

    /**
     * Checks a code the user typed. Throws an ApiException if it's wrong,
     * expired or locked; otherwise marks it as used so it can't be reused.
     */
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
}