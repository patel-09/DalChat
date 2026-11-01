package ca.dalchat.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

// TEMPORARY: prints emails in the Run panel instead of sending them.
// Later we'll add a real sender (SMTP), and nothing else will need to change.
@Component
public class ConsoleEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(ConsoleEmailSender.class);

    @Override
    public void send(String to, String subject, String body) {
        log.info("""

                ======== DEV EMAIL ========
                To: {}
                Subject: {}

                {}
                ===========================""", to, subject, body);
    }
}