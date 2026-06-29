package com.kancelaria.officesystem.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@Async
public class EmailService {

    private final JavaMailSender mailSender;

    // Helper method for sending HTML emails
    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("no-reply@officesystem.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email successfully sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * 1. Notification about a new fine
     */
    public void sendNewCaseNotification(String toEmail, String driverName, String plateNumber, BigDecimal amount) {
        String subject = "🚨 New Penalty Registered - Vehicle: " + plateNumber;
        String html = "<h2>Hello " + driverName + ",</h2>" +
                "<p>A new traffic penalty has been registered in our system for the vehicle with license plate number: <b>" + plateNumber + "</b>.</p>" +
                "<p>Total amount due: <span style='color:red; font-weight:bold;'>" + amount + " PLN</span>.</p>" +
                "<p>Please review the details and settle the payment within 14 days or submit an appeal through the driver portal.</p>" +
                "<br><p>Best regards,<br>Office System Team</p>";

        sendHtmlEmail(toEmail, subject, html);
    }

    /**
     * 2. Notification about an increased fine (Additional penalty added)
     */
    public void sendPenaltyIncreasedNotification(String toEmail, String driverName, BigDecimal addedAmount, BigDecimal totalAmount) {
        String subject = "⚠️ Case Update: Additional Fee Applied";
        String html = "<h2>Hello " + driverName + ",</h2>" +
                "<p>We would like to inform you that the outstanding balance for your case has been updated due to a payment delay.</p>" +
                "<p>An additional late fee has been applied: <b>+" + addedAmount + " PLN</b>.</p>" +
                "<p>The total current amount due is now: <span style='color:orange; font-weight:bold;'>" + totalAmount + " PLN</span>.</p>" +
                "<p>Please settle the outstanding balance immediately to avoid further escalation.</p>" +
                "<br><p>Best regards,<br>Office System Team</p>";

        sendHtmlEmail(toEmail, subject, html);
    }

    /**
     * 3. Notification about transferring the case to court
     */
    public void sendInCourtNotification(String toEmail, String driverName, Integer caseId) {
        String subject = "⚖️ Final Notice: Case Transferred to Court";
        String html = "<h2>Dear Customer " + driverName + ",</h2>" +
                "<p>Please be advised that due to the lack of payment, your penalty case <b>#" + caseId + "</b> has been officially transferred to legal court proceedings.</p>" +
                "<p>The case status has been updated to: <span style='color:darkred; font-weight:bold;'>IN_COURT</span>.</p>" +
                "<p>All further official notices and summons will be delivered through the court of law.</p>" +
                "<br><p>Best regards,<br>Legal Department | Office System</p>";

        sendHtmlEmail(toEmail, subject, html);
    }
}