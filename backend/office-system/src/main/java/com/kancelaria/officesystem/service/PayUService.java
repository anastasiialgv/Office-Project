package com.kancelaria.officesystem.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@Service
public class PayUService {

    @Value("${payu.sandbox.url}")
    private String payuUrl;
    @Value("${payu.pos-id}")
    private String posId;
    @Value("${payu.client-id}")
    private String clientId;
    @Value("${payu.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    private String getAccessToken() {
        String authUrl = payuUrl + "/pl/standard/user/oauth/authorize";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(authUrl, request, Map.class);

        return (String) response.getBody().get("access_token");
    }

    public String createOrder(String caseNumber, java.math.BigDecimal fineAmount, String driverIp) {
        String orderUrl = payuUrl + "/api/v2_1/orders";
        String token = getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        int amountInGroszy = fineAmount.multiply(new java.math.BigDecimal("100")).intValue();

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("notifyUrl", "https://office-project-production-3ce4.up.railway.app/office/payments/notify");
        requestBody.put("customerIp", driverIp);
        requestBody.put("merchantPosId", posId);
        requestBody.put("description", "Payment for case nr CD-" + caseNumber);
        requestBody.put("currencyCode", "PLN");
        requestBody.put("totalAmount", amountInGroszy);

        Map<String, Object> product = new HashMap<>();
        product.put("name", "Fine CD-" + caseNumber);
        product.put("unitPrice", amountInGroszy);
        product.put("quantity", 1);
        requestBody.put("products", List.of(product));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(orderUrl, request, Map.class);

        return (String) response.getBody().get("redirectUri");
    }
}