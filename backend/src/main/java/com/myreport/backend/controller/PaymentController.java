package com.myreport.backend.controller;

import com.myreport.backend.dto.common.ApiResponse;
import com.myreport.backend.dto.payments.PayUOrderRequest;
import com.myreport.backend.dto.payments.RazorpayOrderRequest;
import com.myreport.backend.dto.payments.RazorpayVerifyRequest;
import com.myreport.backend.service.PaymentService;
import jakarta.validation.Valid;
import java.net.URI;
import java.security.Principal;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/razorpay/order")
    public ApiResponse<Map<String, Object>> createOrder(Principal principal, @Valid @RequestBody RazorpayOrderRequest request) {
        return new ApiResponse<>(true, "Razorpay order created", paymentService.createRazorpayOrder(principal.getName(), request));
    }

    @PostMapping("/razorpay/verify")
    public ApiResponse<Map<String, Object>> verifyPayment(Principal principal, @Valid @RequestBody RazorpayVerifyRequest request) {
        return new ApiResponse<>(true, "Razorpay payment verified", paymentService.verifyRazorpayPayment(principal.getName(), request));
    }

    @PostMapping("/payu/order")
    public ApiResponse<Map<String, Object>> createPayUOrder(Principal principal, @Valid @RequestBody PayUOrderRequest request) {
        return new ApiResponse<>(true, "PayU order created", paymentService.createPayUOrder(principal.getName(), request));
    }

    @GetMapping("/payu/status")
    public ApiResponse<Map<String, Object>> getPayUStatus(Principal principal, @RequestParam String txnid) {
        return new ApiResponse<>(true, "PayU payment status loaded", paymentService.getPayUOrderStatus(principal.getName(), txnid));
    }

    @PostMapping(value = "/payu/success", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> handlePayUSuccess(@RequestParam Map<String, String> params) {
        URI redirectUri = paymentService.handlePayUCallback(params);
        return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
    }

    @GetMapping("/payu/success")
    public ResponseEntity<Void> handlePayUSuccessRedirect(@RequestParam Map<String, String> params) {
        URI redirectUri = paymentService.handlePayUCallback(params);
        return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
    }

    @PostMapping(value = "/payu/failure", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> handlePayUFailure(@RequestParam Map<String, String> params) {
        URI redirectUri = paymentService.handlePayUCallback(params);
        return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
    }

    @GetMapping("/payu/failure")
    public ResponseEntity<Void> handlePayUFailureRedirect(@RequestParam Map<String, String> params) {
        URI redirectUri = paymentService.handlePayUCallback(params);
        return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
    }
}
