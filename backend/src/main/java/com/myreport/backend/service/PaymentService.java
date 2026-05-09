package com.myreport.backend.service;

import com.myreport.backend.dto.payments.RazorpayOrderRequest;
import com.myreport.backend.dto.payments.RazorpaySignupOrderRequest;
import com.myreport.backend.dto.payments.RazorpayVerifyRequest;
import com.myreport.backend.entity.PaymentOrder;
import com.myreport.backend.entity.UserAccount;
import com.myreport.backend.exception.ApiException;
import com.myreport.backend.repository.PaymentOrderRepository;
import com.myreport.backend.repository.UserAccountRepository;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final UserAccountRepository userAccountRepository;
    private final PaymentOrderRepository paymentOrderRepository;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Transactional
    public Map<String, Object> createRazorpayOrder(String email, RazorpayOrderRequest request) {
        UserAccount admin = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));

        String orderReference = "order_" + System.currentTimeMillis();
        PaymentOrder order = PaymentOrder.builder()
                .admin(admin)
                .orderReference(orderReference)
                .amount(request.amount())
                .currency("INR")
                .status("created")
                .paymentGateway("RAZORPAY")
                .metadataJson("plan=" + request.planName())
                .build();
        paymentOrderRepository.save(order);

        if (razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeySecret == null
                || razorpayKeySecret.isBlank()) {
            return mockOrder(request, orderReference);
        }

        RestClient client = RestClient.builder()
                .baseUrl("https://api.razorpay.com/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION,
                        "Basic " + Base64.getEncoder()
                                .encodeToString((razorpayKeyId + ":" + razorpayKeySecret).getBytes()))
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        Map<String, Object> payload = Map.of(
                "amount", request.amount().multiply(BigDecimal.valueOf(100)).intValue(),
                "currency", "INR",
                "receipt", orderReference,
                "notes", Map.of("plan", request.planName(), "adminEmail", email));

        try {
            Map<?, ?> response = client.post()
                    .uri("/orders")
                    .body(payload)
                    .retrieve()
                    .body(Map.class);

            String gatewayOrderId = response != null ? String.valueOf(response.get("id")) : null;
            order.setGatewayOrderId(gatewayOrderId);
            paymentOrderRepository.save(order);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("configured", true);
            result.put("keyId", razorpayKeyId);
            result.put("orderId", gatewayOrderId);
            result.put("amount", request.amount());
            result.put("currency", "INR");
            result.put("planName", request.planName());
            result.put("gatewayResponse", response);
            return result;
        } catch (Exception exception) {
            order.setStatus("fallback");
            paymentOrderRepository.save(order);
            return mockOrder(request, orderReference);
        }
    }

    @Transactional
    public Map<String, Object> createRazorpaySignupOrder(RazorpaySignupOrderRequest request) {
        String orderReference = "signup_" + System.currentTimeMillis();
        PaymentOrder order = PaymentOrder.builder()
                .admin(null)
                .orderReference(orderReference)
                .amount(request.amount())
                .currency("INR")
                .status("created")
                .paymentGateway("RAZORPAY")
                .metadataJson("flow=signup;plan=" + request.planName() + ";email=" + request.email())
                .build();
        paymentOrderRepository.save(order);

        if (razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeySecret == null
                || razorpayKeySecret.isBlank()) {
            Map<String, Object> mock = mockOrder(new RazorpayOrderRequest(request.planName(), request.amount()), orderReference);
            mock.put("flow", "signup");
            return mock;
        }

        RestClient client = RestClient.builder()
                .baseUrl("https://api.razorpay.com/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION,
                        "Basic " + Base64.getEncoder()
                                .encodeToString((razorpayKeyId + ":" + razorpayKeySecret).getBytes()))
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        Map<String, Object> payload = Map.of(
                "amount", request.amount().multiply(BigDecimal.valueOf(100)).intValue(),
                "currency", "INR",
                "receipt", orderReference,
                "notes", Map.of("flow", "signup", "plan", request.planName(), "email", request.email()));

        try {
            Map<?, ?> response = client.post()
                    .uri("/orders")
                    .body(payload)
                    .retrieve()
                    .body(Map.class);

            String gatewayOrderId = response != null ? String.valueOf(response.get("id")) : null;
            order.setGatewayOrderId(gatewayOrderId);
            paymentOrderRepository.save(order);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("configured", true);
            result.put("flow", "signup");
            result.put("keyId", razorpayKeyId);
            result.put("orderId", gatewayOrderId);
            result.put("amount", request.amount());
            result.put("currency", "INR");
            result.put("planName", request.planName());
            return result;
        } catch (Exception exception) {
            order.setStatus("fallback");
            paymentOrderRepository.save(order);
            Map<String, Object> mock = mockOrder(new RazorpayOrderRequest(request.planName(), request.amount()), orderReference);
            mock.put("flow", "signup");
            return mock;
        }
    }

    @Transactional
    public Map<String, Object> verifyRazorpayPayment(String email, RazorpayVerifyRequest request) {
        userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));
        return verifyRazorpayPayment(request);
    }

    @Transactional
    public Map<String, Object> verifyRazorpayPayment(RazorpayVerifyRequest request) {
        if (razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Razorpay is not configured");
        }

        PaymentOrder order = paymentOrderRepository.findByGatewayOrderId(request.razorpayOrderId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment order not found"));

        String payload = request.razorpayOrderId() + "|" + request.razorpayPaymentId();
        String expected = hmacSha256Hex(payload, razorpayKeySecret);
        boolean valid = MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                request.razorpaySignature().getBytes(StandardCharsets.UTF_8)
        );

        order.setGatewayPaymentId(request.razorpayPaymentId());
        order.setGatewaySignature(request.razorpaySignature());
        order.setStatus(valid ? "paid" : "signature_mismatch");
        paymentOrderRepository.save(order);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("verified", valid);
        result.put("status", order.getStatus());
        result.put("orderReference", order.getOrderReference());
        result.put("gatewayOrderId", order.getGatewayOrderId());
        result.put("gatewayPaymentId", order.getGatewayPaymentId());
        return result;
    }

    private static String hmacSha256Hex(String data, String secret) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKey);
            byte[] bytes = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to verify signature");
        }
    }

    private Map<String, Object> mockOrder(RazorpayOrderRequest request, String orderReference) {
        Map<String, Object> mock = new LinkedHashMap<>();
        mock.put("configured", false);
        mock.put("keyId", razorpayKeyId == null || razorpayKeyId.isBlank() ? "rzp_test_your_key" : razorpayKeyId);
        mock.put("orderId", orderReference);
        mock.put("amount", request.amount());
        mock.put("currency", "INR");
        mock.put("planName", request.planName());
        mock.put("mode", "demo");
        return mock;
    }
}
