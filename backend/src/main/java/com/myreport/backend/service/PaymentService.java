package com.myreport.backend.service;

import com.myreport.backend.dto.payments.RazorpayOrderRequest;
import com.myreport.backend.entity.PaymentOrder;
import com.myreport.backend.entity.UserAccount;
import com.myreport.backend.exception.ApiException;
import com.myreport.backend.repository.PaymentOrderRepository;
import com.myreport.backend.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
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

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("configured", true);
            result.put("keyId", razorpayKeyId);
            result.put("orderId", response != null ? response.get("id") : null);
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
