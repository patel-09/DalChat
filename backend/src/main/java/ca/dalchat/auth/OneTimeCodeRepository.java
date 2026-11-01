package ca.dalchat.auth;

import java.util.Optional;

import ca.dalchat.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OneTimeCodeRepository extends JpaRepository<OneTimeCode, Long> {

    // The newest unused code of a given purpose for this user
    Optional<OneTimeCode> findFirstByUserAndPurposeAndUsedAtIsNullOrderByIdDesc(
            User user, CodePurpose purpose);

    // Remove a user's old codes of one purpose (before issuing a new one)
    void deleteByUserAndPurpose(User user, CodePurpose purpose);
}