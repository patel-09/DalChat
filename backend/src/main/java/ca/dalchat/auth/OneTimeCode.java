package ca.dalchat.auth;

import java.time.LocalDateTime;

import ca.dalchat.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "one_time_codes")
public class OneTimeCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "purpose", nullable = false, length = 30)
    private CodePurpose purpose;

    @Column(name = "code_hash", nullable = false, length = 100)
    private String codeHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "attempts", nullable = false)
    private int attempts;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    protected OneTimeCode() {
    }

    public OneTimeCode(User user, CodePurpose purpose, String codeHash, LocalDateTime expiresAt) {
        this.user = user;
        this.purpose = purpose;
        this.codeHash = codeHash;
        this.expiresAt = expiresAt;
        this.attempts = 0;
    }

    // ---- Behaviour ----
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isUsed() {
        return usedAt != null;
    }

    public void recordFailedAttempt() {
        attempts++;
    }

    public void markUsed() {
        usedAt = LocalDateTime.now();
    }

    // ---- Getters ----
    public Long getId() { return id; }
    public User getUser() { return user; }
    public CodePurpose getPurpose() { return purpose; }
    public String getCodeHash() { return codeHash; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public int getAttempts() { return attempts; }
    public LocalDateTime getUsedAt() { return usedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}