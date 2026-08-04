package com.kancelaria.officesystem.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Async
public class EmailService {

    private final RestTemplate restTemplate = new RestTemplate();

    private String mailtrapApiToken;

    @Value("${mailtrap.inbox-id}")
    private String mailtrapInboxId;

    @Value("${mailtrap.from-email:no-reply@officesystem.com}")
    private String fromEmail;


    @Value("${frontend.base-url}")
    private String FRONTEND_BASE_URL;
    // Helper method for sending HTML emails
    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(mailtrapApiToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> fromMap = new HashMap<>();
            fromMap.put("email", fromEmail);
            fromMap.put("name", "Office System");

            Map<String, Object> toMap = new HashMap<>();
            toMap.put("email", to);

            Map<String, Object> body = new HashMap<>();
            body.put("from", fromMap);
            body.put("to", List.of(toMap));
            body.put("subject", subject);
            body.put("html", htmlContent);
            body.put("category", "office-system-notification");

            String url = "https://sandbox.api.mailtrap.io/api/send/" + mailtrapInboxId;

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Email successfully sent to {}", to);
            } else {
                log.error("Mailtrap API returned non-2xx status {} for {}", response.getStatusCode(), to);
            }
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * 1. Notification about a new fine
     */
    public void sendNewCaseNotification(String toEmail, String driverName, String plateNumber, BigDecimal amount, Integer caseId) {
        String subject = "🚨 New Penalty Registered - Vehicle: " + plateNumber;
        String paymentLink = FRONTEND_BASE_URL + "/pay/" + caseId;
        String html = "<h2>Hello " + driverName + ",</h2>" +
                "<p>A new traffic penalty has been registered in our system for the vehicle with license plate number: <b>" + plateNumber + "</b>.</p>" +
                "<p>Total amount due: <span style='color:red; font-weight:bold;'>" + amount + " PLN</span>.</p>" +
                "<p>Please review the details and settle the payment within 14 days.</p>" +

                // Красивая кнопка для оплаты
                "<div style='margin: 25px 0;'>" +
                "  <a href='" + paymentLink + "' style='background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>Pay Fine Online</a>" +
                "</div>" +

                "<p style='font-size: 12px; color: #666;'>If the button doesn't work, copy and paste this link into your browser:<br><a href='" + paymentLink + "'>" + paymentLink + "</a></p>" +
                "<br><p>Best regards,<br>Office System Team</p>";

        sendHtmlEmail(toEmail, subject, html);
    }

    /**
     * 2. Notification about an increased fine (Additional penalty added)
     */
    public void sendPenaltyIncreasedNotification(String toEmail, String driverName, BigDecimal addedAmount, BigDecimal totalAmount, Integer caseId) {
        String paymentLink = FRONTEND_BASE_URL + "/pay/" + caseId;
        String subject = "⚠️ Case Update: Additional Fee Applied";
        String html = "<h2>Hello " + driverName + ",</h2>" +
                "<p>We would like to inform you that the outstanding balance for your case has been updated due to a payment delay.</p>" +
                "<p>An additional late fee has been applied: <b>+" + addedAmount + " PLN</b>.</p>" +
                "<p>The total current amount due is now: <span style='color:orange; font-weight:bold;'>" + totalAmount + " PLN</span>.</p>" +
                "<div style='margin: 25px 0;'>" +
                "  <a href='" + paymentLink + "' style='background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>Settle Updated Balance</a>" +
                "</div>" +
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