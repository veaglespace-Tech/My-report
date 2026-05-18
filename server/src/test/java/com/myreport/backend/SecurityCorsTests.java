package com.myreport.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityCorsTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void allowsLoopbackFrontendOriginsForPaymentOrderPreflight() throws Exception {
        mockMvc.perform(options("/api/auth/register/payu/order")
                        .header("Origin", "http://127.0.0.1:3004")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:3004"));
    }

    @Test
    void allowsViteFrontendOriginForPaymentOrderPreflight() throws Exception {
        mockMvc.perform(options("/api/auth/register/payu/order")
                        .header("Origin", "http://localhost:3004")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3004"));
    }

    @Test
    void allowsPayUTestOriginForPaymentCallbackPreflight() throws Exception {
        mockMvc.perform(options("/api/payments/payu/success")
                        .header("Origin", "https://test.payu.in")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://test.payu.in"));
    }

    @Test
    void allowsNullOriginForPayURedirectCallback() throws Exception {
        mockMvc.perform(get("/api/payments/payu/success")
                        .header("Origin", "null"))
                .andExpect(status().isFound())
                .andExpect(header().string("Access-Control-Allow-Origin", "null"))
                .andExpect(header().string("Location", "http://localhost:3004/payment/payu/return?flow=unknown&txnid=missing&status=missing_txnid&verified=false"));
    }

    @Test
    void allowsNullOriginForPayUPostCallback() throws Exception {
        mockMvc.perform(post("/api/payments/payu/success")
                        .header("Origin", "null")
                        .contentType("application/x-www-form-urlencoded")
                        .param("txnid", ""))
                .andExpect(status().isFound())
                .andExpect(header().string("Access-Control-Allow-Origin", "null"))
                .andExpect(header().string("Location", "http://localhost:3004/payment/payu/return?flow=unknown&txnid=missing&status=missing_txnid&verified=false"));
    }

    @Test
    void allowsDirectBrowserVisitToPayUSuccessCallback() throws Exception {
        mockMvc.perform(get("/api/payments/payu/success"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", "http://localhost:3004/payment/payu/return?flow=unknown&txnid=missing&status=missing_txnid&verified=false"));
    }
}
