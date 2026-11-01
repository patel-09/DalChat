package ca.dalchat.email;

public interface EmailSender {
    void send(String to, String subject, String body);
}