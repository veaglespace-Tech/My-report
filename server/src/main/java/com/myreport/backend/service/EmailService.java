package com.myreport.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email:mg@info.veaglespace.com}")
    private String fromEmail;

    @Value("${app.email.from-name:MyReport}")
    private String fromName;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${spring.mail.host:}")
    private String smtpHost;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(effectiveFromEmail());
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendHtmlEmail(String to, String subject, String plainBody, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        setFrom(helper);
        helper.setTo(to);
        helper.setReplyTo(effectiveFromEmail());
        helper.setSubject(subject);
        helper.setText(plainBody, htmlBody);
        helper.setSentDate(new Date());
        addTransactionalHeaders(message);
        mailSender.send(message);
    }

    public boolean isSmtpConfigured() {
        return hasText(smtpHost) && hasText(smtpUsername);
    }

    private void setFrom(MimeMessageHelper helper) throws MessagingException {
        String from = effectiveFromEmail();
        try {
            helper.setFrom(from, effectiveFromName());
        } catch (UnsupportedEncodingException exception) {
            helper.setFrom(from);
        }
    }

    private String effectiveFromEmail() {
        if (hasText(fromEmail)) {
            return fromEmail.trim();
        }
        if (hasText(smtpUsername)) {
            return smtpUsername.trim();
        }
        return "no-reply@myreport.local";
    }

    private String effectiveFromName() {
        return hasText(fromName) ? fromName.trim() : "MyReport";
    }

    private void addTransactionalHeaders(MimeMessage message) throws MessagingException {
        message.addHeader("Auto-Submitted", "auto-generated");
        message.addHeader("X-Auto-Response-Suppress", "All");
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
