package ca.dalchat.user;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 40)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 40)
    private String lastName;

    @Column(name = "email", nullable = false, length = 254, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "program", length = 60)
    private String program;

    @Column(name = "year_of_study", length = 20)
    private String yearOfStudy;

    @Column(name = "bio", length = 160)
    private String bio;

    @Column(name = "email_verified", nullable = false, columnDefinition = "TINYINT(1)")
    private boolean emailVerified;

    // MySQL fills these in automatically, so Java never writes them
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    // JPA needs an empty constructor to build objects from database rows
    protected User() {
    }

    public User(String firstName, String lastName, String email, String passwordHash) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.emailVerified = false;
    }

    // ---- Getters (read a value) ----
    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getProgram() { return program; }
    public String getYearOfStudy() { return yearOfStudy; }
    public String getBio() { return bio; }
    public boolean isEmailVerified() { return emailVerified; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // ---- Setters (change a value) ----
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setProgram(String program) { this.program = program; }
    public void setYearOfStudy(String yearOfStudy) { this.yearOfStudy = yearOfStudy; }
    public void setBio(String bio) { this.bio = bio; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
}