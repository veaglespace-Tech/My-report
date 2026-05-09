package com.myreport.backend.controller;

import com.myreport.backend.dto.common.ApiResponse;
import com.myreport.backend.dto.payments.RazorpayOrderRequest;
import com.myreport.backend.dto.payments.RazorpayVerifyRequest;
import com.myreport.backend.service.PaymentService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
