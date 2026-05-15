package com.myreport.backend.service;

import com.myreport.backend.dto.payments.RazorpayOrderRequest;
import com.myreport.backend.dto.payments.RazorpaySignupOrderRequest;
import com.myreport.backend.dto.payments.RazorpayVerifyRequest;
import com.myreport.backend.dto.payments.PayUOrderRequest;
import com.myreport.backend.dto.payments.PayUSignupOrderRequest;
import com.myreport.backend.entity.PaymentOrder;
import com.myreport.backend.entity.Plan;
import com.myreport.backend.entity.Store;
import com.myreport.backend.entity.UserAccount;
import com.myreport.backend.entity.enums.PlanStatus;
import com.myreport.backend.exception.ApiException;
import com.myreport.backend.repository.PaymentOrderRepository;
import com.myreport.backend.repository.PlanRepository;
import com.myreport.backend.repository.StoreRepository;
import com.myreport.backend.repository.UserAccountRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDate;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final UserAccountRepository userAccountRepository;
    private final PaymentOrderRepository paymentOrderRepository;
    private final PlanRepository planRepository;
    private final StoreRepository storeRepository;
    private final PlanDateService planDateService;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${payu.merchant-key:}")
    private String payuMerchantKey;

    @Value("${payu.merchant-salt:}")
    private String payuMerchantSalt;

    @Value("${payu.base-url:https://secure.payu.in/_payment}")
    private String payuBaseUrl;

    @Value("${app.backend-origin:http://localhost:8080}")
    private String backendOrigin;

    @Value("${app.frontend-origin:http://localhost:3000}")
    private String frontendOrigin;

    @Transactional
    public Map<String, Object> createRazorpayOrder(String email, RazorpayOrderRequest request) {
        UserAccount admin = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));
        Plan plan = resolvePaidPlan(request.planName(), request.amount());
        BigDecimal amount = paymentAmount(plan);

        String orderReference = "order_" + System.currentTimeMillis();
        PaymentOrder order = PaymentOrder.builder()
                .admin(admin)
                .orderReference(orderReference)
                .amount(amount)
                .currency("INR")
                .status("created")
                .paymentGateway("RAZORPAY")
                .metadataJson("plan=" + plan.getName())
                .build();
        paymentOrderRepository.save(order);

        if (!isRazorpayConfigured()) {
            return mockOrder(new RazorpayOrderRequest(plan.getName(), amount), orderReference);
        }

        RestClient client = RestClient.builder()
                .baseUrl("https://api.razorpay.com/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION,
                        "Basic " + Base64.getEncoder()
                                .encodeToString((configuredKeyId() + ":" + configuredKeySecret()).getBytes()))
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        Map<String, Object> payload = Map.of(
                "amount", amount.multiply(BigDecimal.valueOf(100)).intValue(),
                "currency", "INR",
                "receipt", orderReference,
                "notes", Map.of("plan", plan.getName(), "adminEmail", email));

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
            result.put("keyId", configuredKeyId());
            result.put("orderId", gatewayOrderId);
            result.put("amount", amount);
            result.put("currency", "INR");
            result.put("planName", plan.getName());
            result.put("gatewayResponse", response);
            return result;
        } catch (Exception exception) {
            order.setStatus("fallback");
            paymentOrderRepository.save(order);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to create Razorpay order. Check Razorpay credentials and network access.");
        }
    }

    @Transactional
    public Map<String, Object> createRazorpaySignupOrder(RazorpaySignupOrderRequest request) {
        Plan plan = resolvePaidPlan(request.planName(), request.amount());
        BigDecimal amount = paymentAmount(plan);
        String orderReference = "signup_" + System.currentTimeMillis();
        PaymentOrder order = PaymentOrder.builder()
                .admin(null)
                .orderReference(orderReference)
                .amount(amount)
                .currency("INR")
                .status("created")
                .paymentGateway("RAZORPAY")
                .metadataJson("flow=signup;plan=" + plan.getName() + ";email=" + request.email())
                .build();
        paymentOrderRepository.save(order);

        if (!isRazorpayConfigured()) {
            Map<String, Object> mock = mockOrder(new RazorpayOrderRequest(plan.getName(), amount), orderReference);
            mock.put("flow", "signup");
            return mock;
        }

        RestClient client = RestClient.builder()
                .baseUrl("https://api.razorpay.com/v1")
                .defaultHeader(HttpHeaders.AUTHORIZATION,
                        "Basic " + Base64.getEncoder()
                                .encodeToString((configuredKeyId() + ":" + configuredKeySecret()).getBytes()))
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        Map<String, Object> payload = Map.of(
                "amount", amount.multiply(BigDecimal.valueOf(100)).intValue(),
                "currency", "INR",
                "receipt", orderReference,
                "notes", Map.of("flow", "signup", "plan", plan.getName(), "email", request.email()));

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
            result.put("keyId", configuredKeyId());
            result.put("orderId", gatewayOrderId);
            result.put("amount", amount);
            result.put("currency", "INR");
            result.put("planName", plan.getName());
            return result;
        } catch (Exception exception) {
            order.setStatus("fallback");
            paymentOrderRepository.save(order);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to create Razorpay signup order. Check Razorpay credentials and network access.");
        }
    }

    @Transactional
    public Map<String, Object> createPayUOrder(String email, PayUOrderRequest request) {
        UserAccount admin = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));

        return createPayUOrderPayload(
                admin,
                "renewal",
                request.planName(),
                request.amount(),
                admin.getFullName(),
                admin.getEmail(),
                admin.getMobileNumber());
    }

    @Transactional
    public Map<String, Object> createPayUSignupOrder(PayUSignupOrderRequest request) {
        String normalizedEmail = normalizeConfigValue(request.email()).toLowerCase();
        if (userAccountRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "An account already exists for this admin email");
        }

        return createPayUOrderPayload(
                null,
                "signup",
                request.planName(),
                request.amount(),
                request.firstname(),
                normalizedEmail,
                request.phone());
    }

    @Transactional
    public URI handlePayUCallback(Map<String, String> params) {
        String txnId = param(params, "txnid");
        if (!hasText(txnId)) {
            return payuReturnUri("unknown", "missing", "missing_txnid", false);
        }

        PaymentOrder order = paymentOrderRepository.findByOrderReference(txnId)
                .orElse(null);
        if (order == null) {
            return payuReturnUri("unknown", txnId, "order_not_found", false);
        }

        boolean validHash = verifyPayUResponseHash(params);
        boolean validOrder = payuOrderMatchesResponse(order, params);
        boolean paid = validHash && validOrder && "success".equalsIgnoreCase(param(params, "status"));

        order.setGatewayPaymentId(firstText(param(params, "mihpayid"), param(params, "payuMoneyId")));
        order.setGatewaySignature(param(params, "hash"));
        order.setStatus(paid ? "paid" : validHash ? "payment_failed" : "signature_mismatch");
        paymentOrderRepository.save(order);

        if (paid && order.getAdmin() != null) {
            applyPlanFromPaymentOrder(order.getAdmin(), order);
        }

        return payuReturnUri(extractMetadataValue(order.getMetadataJson(), "flow"), txnId, order.getStatus(), paid);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPayUOrderStatus(String email, String txnId) {
        UserAccount admin = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));
        PaymentOrder order = paymentOrderRepository.findByOrderReference(txnId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment order not found"));

        if (order.getAdmin() == null || !order.getAdmin().getId().equals(admin.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Payment order does not belong to this account");
        }

        return buildPayUStatus(order);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPayUSignupOrderStatus(String txnId) {
        PaymentOrder order = paymentOrderRepository.findByOrderReference(txnId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment order not found"));

        if (!"signup".equalsIgnoreCase(extractMetadataValue(order.getMetadataJson(), "flow"))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment order is not a signup order");
        }

        return buildPayUStatus(order);
    }

    @Transactional
    public Map<String, Object> verifyRazorpayPayment(String email, RazorpayVerifyRequest request) {
        UserAccount admin = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));
        Map<String, Object> result = verifyRazorpayPayment(request);
        if (Boolean.TRUE.equals(result.get("verified"))) {
            applyPlanFromPaymentOrder(admin, request.razorpayOrderId());
        }
        return result;
    }

    @Transactional
    public Map<String, Object> verifyRazorpayPayment(RazorpayVerifyRequest request) {
        if (!hasText(configuredKeySecret())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Razorpay is not configured");
        }

        PaymentOrder order = paymentOrderRepository.findByGatewayOrderId(request.razorpayOrderId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment order not found"));

        String payload = request.razorpayOrderId() + "|" + request.razorpayPaymentId();
        String expected = hmacSha256Hex(payload, configuredKeySecret());
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

    private Map<String, Object> createPayUOrderPayload(
            UserAccount admin,
            String flow,
            String planName,
            BigDecimal amount,
            String firstname,
            String email,
            String phone) {
        Plan plan = resolvePaidPlan(planName, amount);
        String resolvedPlanName = plan.getName();
        BigDecimal resolvedAmount = paymentAmount(plan);
        String txnId = "MYR" + System.currentTimeMillis() + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
        String formattedAmount = formatPayUAmount(resolvedAmount);
        String normalizedEmail = normalizeConfigValue(email).toLowerCase();
        String customerName = firstText(normalizeConfigValue(firstname), "MyReport User");
        String customerPhone = normalizeConfigValue(phone);
        if (!hasText(normalizedEmail) || !hasText(customerPhone)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Customer email and phone are required for PayU payment");
        }

        PaymentOrder order = PaymentOrder.builder()
                .admin(admin)
                .orderReference(txnId)
                .amount(resolvedAmount)
                .currency("INR")
                .status("created")
                .paymentGateway("PAYU")
                .gatewayOrderId(txnId)
                .metadataJson("flow=" + flow + ";plan=" + resolvedPlanName + ";email=" + normalizedEmail)
                .build();
        paymentOrderRepository.save(order);

        if (!isPayUConfigured()) {
            Map<String, Object> mock = new LinkedHashMap<>();
            mock.put("configured", false);
            mock.put("gateway", "PAYU");
            mock.put("txnid", txnId);
            mock.put("orderId", txnId);
            mock.put("amount", formattedAmount);
            mock.put("currency", "INR");
            mock.put("planName", resolvedPlanName);
            mock.put("mode", "demo");
            return mock;
        }

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("key", configuredPayUMerchantKey());
        fields.put("txnid", txnId);
        fields.put("amount", formattedAmount);
        fields.put("productinfo", resolvedPlanName);
        fields.put("firstname", customerName);
        fields.put("email", normalizedEmail);
        fields.put("phone", customerPhone);
        fields.put("surl", backendBaseUrl() + "/api/payments/payu/success");
        fields.put("furl", backendBaseUrl() + "/api/payments/payu/failure");
        fields.put("udf1", flow);
        fields.put("udf2", txnId);
        fields.put("udf3", "");
        fields.put("udf4", "");
        fields.put("udf5", "");
        fields.put("hash", generatePayURequestHash(fields));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("configured", true);
        result.put("gateway", "PAYU");
        result.put("paymentUrl", configuredPayUBaseUrl());
        result.put("formFields", fields);
        result.put("txnid", txnId);
        result.put("orderId", txnId);
        result.put("amount", formattedAmount);
        result.put("currency", "INR");
        result.put("planName", resolvedPlanName);
        result.put("flow", flow);
        return result;
    }

    private boolean verifyPayUResponseHash(Map<String, String> params) {
        String providedHash = param(params, "hash");
        if (!hasText(providedHash) || !isPayUConfigured()) {
            return false;
        }

        String status = param(params, "status");
        String udf1 = param(params, "udf1");
        String udf2 = param(params, "udf2");
        String udf3 = param(params, "udf3");
        String udf4 = param(params, "udf4");
        String udf5 = param(params, "udf5");
        String key = param(params, "key");
        String txnId = param(params, "txnid");
        String amount = param(params, "amount");
        String productInfo = param(params, "productinfo");
        String firstname = param(params, "firstname");
        String email = param(params, "email");
        String additionalCharges = param(params, "additional_charges");

        String reverseHash = configuredPayUMerchantSalt()
                + "|" + status
                + "||||||"
                + udf5 + "|" + udf4 + "|" + udf3 + "|" + udf2 + "|" + udf1
                + "|" + email + "|" + firstname + "|" + productInfo + "|" + amount + "|" + txnId + "|" + key;

        String hashString = hasText(additionalCharges)
                ? additionalCharges + "|" + reverseHash
                : reverseHash;
        String expected = sha512Hex(hashString);
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                providedHash.toLowerCase().getBytes(StandardCharsets.UTF_8)
        );
    }

    private boolean payuOrderMatchesResponse(PaymentOrder order, Map<String, String> params) {
        if (!configuredPayUMerchantKey().equals(param(params, "key"))) {
            return false;
        }
        if (!order.getOrderReference().equals(param(params, "txnid"))) {
            return false;
        }
        if (!order.getOrderReference().equals(param(params, "udf2"))) {
            return false;
        }
        String planName = extractMetadataValue(order.getMetadataJson(), "plan");
        if (hasText(planName) && !planName.equals(param(params, "productinfo"))) {
            return false;
        }
        try {
            BigDecimal responseAmount = new BigDecimal(param(params, "amount")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal orderAmount = order.getAmount().setScale(2, RoundingMode.HALF_UP);
            return orderAmount.compareTo(responseAmount) == 0;
        } catch (Exception exception) {
            return false;
        }
    }

    private String generatePayURequestHash(Map<String, String> fields) {
        String hashString = param(fields, "key")
                + "|" + param(fields, "txnid")
                + "|" + param(fields, "amount")
                + "|" + param(fields, "productinfo")
                + "|" + param(fields, "firstname")
                + "|" + param(fields, "email")
                + "|" + param(fields, "udf1")
                + "|" + param(fields, "udf2")
                + "|" + param(fields, "udf3")
                + "|" + param(fields, "udf4")
                + "|" + param(fields, "udf5")
                + "||||||"
                + configuredPayUMerchantSalt();
        return sha512Hex(hashString);
    }

    private Map<String, Object> buildPayUStatus(PaymentOrder order) {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("gateway", "PAYU");
        status.put("verified", "paid".equalsIgnoreCase(order.getStatus()));
        status.put("status", order.getStatus());
        status.put("txnid", order.getOrderReference());
        status.put("orderReference", order.getOrderReference());
        status.put("gatewayPaymentId", order.getGatewayPaymentId());
        status.put("amount", order.getAmount());
        status.put("currency", order.getCurrency());
        status.put("planName", extractMetadataValue(order.getMetadataJson(), "plan"));
        status.put("flow", extractMetadataValue(order.getMetadataJson(), "flow"));
        return status;
    }

    private URI payuReturnUri(String flow, String txnId, String status, boolean verified) {
        return UriComponentsBuilder
                .fromUriString(frontendBaseUrl() + "/payment/payu/return")
                .queryParam("flow", firstText(flow, "unknown"))
                .queryParam("txnid", firstText(txnId, ""))
                .queryParam("status", firstText(status, "unknown"))
                .queryParam("verified", verified)
                .build()
                .toUri();
    }

    private Plan resolvePaidPlan(String planName, BigDecimal requestedAmount) {
        Plan plan = planRepository.findAllByStatusOrderByCreatedAtDesc(PlanStatus.ACTIVE).stream()
                .filter(item -> item.getName() != null && item.getName().equalsIgnoreCase(normalizeConfigValue(planName)))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Selected plan is not available"));

        BigDecimal expectedAmount = paymentAmount(plan);
        if (expectedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Selected plan does not require payment");
        }

        BigDecimal normalizedRequestedAmount = requestedAmount == null
                ? BigDecimal.ZERO
                : requestedAmount.setScale(2, RoundingMode.HALF_UP);
        if (expectedAmount.compareTo(normalizedRequestedAmount) != 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Plan amount does not match current pricing");
        }

        return plan;
    }

    private static BigDecimal paymentAmount(Plan plan) {
        BigDecimal amount = plan.getMonthlyPrice() != null ? plan.getMonthlyPrice() : plan.getPrice();
        return (amount == null ? BigDecimal.ZERO : amount).setScale(2, RoundingMode.HALF_UP);
    }

    private static String formatPayUAmount(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private static String sha512Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-512");
            byte[] bytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate payment hash");
        }
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

    private boolean isRazorpayConfigured() {
        return hasText(configuredKeyId()) && hasText(configuredKeySecret());
    }

    private boolean isPayUConfigured() {
        return hasText(configuredPayUMerchantKey())
                && hasText(configuredPayUMerchantSalt())
                && hasText(configuredPayUBaseUrl());
    }

    private String configuredKeyId() {
        return normalizeConfigValue(razorpayKeyId);
    }

    private String configuredKeySecret() {
        return normalizeConfigValue(razorpayKeySecret);
    }

    private String configuredPayUMerchantKey() {
        return normalizeConfigValue(payuMerchantKey);
    }

    private String configuredPayUMerchantSalt() {
        return normalizeConfigValue(payuMerchantSalt);
    }

    private String configuredPayUBaseUrl() {
        return normalizeConfigValue(payuBaseUrl);
    }

    private String backendBaseUrl() {
        String value = normalizeConfigValue(backendOrigin);
        return hasText(value) ? value.replaceAll("/$", "") : "http://localhost:8080";
    }

    private String frontendBaseUrl() {
        if (frontendOrigin == null || frontendOrigin.isBlank()) {
            return "http://localhost:3000";
        }

        String[] origins = frontendOrigin.split(",");
        for (String origin : origins) {
            String value = origin.trim().replaceAll("/$", "");
            if (value.equals("http://localhost:3000") || value.equals("http://127.0.0.1:3000")) {
                return value;
            }
        }

        String firstOrigin = origins[0].trim().replaceAll("/$", "");
        if (firstOrigin.equals("http://localhost:5173") || firstOrigin.equals("http://127.0.0.1:5173")) {
            return firstOrigin.replace(":5173", ":3000");
        }
        return firstOrigin.isBlank() ? "http://localhost:3000" : firstOrigin;
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static String param(Map<String, String> params, String key) {
        return normalizeConfigValue(params.get(key));
    }

    private static String firstText(String... values) {
        for (String value : values) {
            if (hasText(value)) {
                return value.trim();
            }
        }
        return "";
    }

    private static String normalizeConfigValue(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        if (trimmed.length() >= 2
                && ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
                || (trimmed.startsWith("'") && trimmed.endsWith("'")))) {
            return trimmed.substring(1, trimmed.length() - 1).trim();
        }
        return trimmed;
    }

    private Map<String, Object> mockOrder(RazorpayOrderRequest request, String orderReference) {
        Map<String, Object> mock = new LinkedHashMap<>();
        mock.put("configured", false);
        mock.put("keyId", hasText(configuredKeyId()) ? configuredKeyId() : "rzp_test_your_key");
        mock.put("orderId", orderReference);
        mock.put("amount", request.amount());
        mock.put("currency", "INR");
        mock.put("planName", request.planName());
        mock.put("mode", "demo");
        return mock;
    }

    private void applyPlanFromPaymentOrder(UserAccount admin, String gatewayOrderId) {
        PaymentOrder order = paymentOrderRepository.findByGatewayOrderId(gatewayOrderId).orElse(null);
        applyPlanFromPaymentOrder(admin, order);
    }

    private void applyPlanFromPaymentOrder(UserAccount admin, PaymentOrder order) {
        if (order == null || order.getAdmin() == null || !order.getAdmin().getId().equals(admin.getId())) {
            return;
        }

        String planName = extractMetadataValue(order.getMetadataJson(), "plan");
        if (!hasText(planName)) {
            return;
        }

        Plan plan = planRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(item -> item.getName() != null && item.getName().equalsIgnoreCase(planName))
                .findFirst()
                .orElse(null);
        if (plan == null) {
            return;
        }

        Store store = storeRepository.findByOwnerId(admin.getId()).orElse(null);
        if (store == null) {
            return;
        }

        LocalDate planStartedAt = LocalDate.now();
        store.setPlan(plan);
        store.setPlanStartedAt(planStartedAt);
        store.setPlanExpiresAt(planDateService.calculateExpiry(plan, planStartedAt));
        storeRepository.save(store);
    }

    private String extractMetadataValue(String metadataJson, String key) {
        if (!hasText(metadataJson)) {
            return null;
        }
        for (String part : metadataJson.split(";")) {
            String trimmed = part.trim();
            String prefix = key.toLowerCase() + "=";
            if (trimmed.toLowerCase().startsWith(prefix)) {
                return trimmed.substring(prefix.length()).trim();
            }
        }
        return null;
    }

}
