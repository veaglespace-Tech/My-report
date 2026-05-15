package com.myreport.backend;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myreport.backend.repository.PaymentOrderRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(properties = {
        "payu.merchant-key=testkey",
        "payu.merchant-salt=testsalt",
        "payu.base-url=https://test.payu.in/_payment"
})
@AutoConfigureMockMvc
class PayUPaymentTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void completesSignupPayUOrderWithValidGatewayCallback() throws Exception {
        String email = "payu-smoke-" + System.currentTimeMillis() + "@example.com";

        MvcResult orderResult = mockMvc.perform(post("/api/auth/register/payu/order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "firstname": "PayU Smoke",
                                  "phone": "9876543210",
                                  "planName": "Starter",
                                  "amount": 1499
                                }
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.configured", is(true)))
                .andExpect(jsonPath("$.data.gateway", is("PAYU")))
                .andReturn();

        JsonNode fields = objectMapper.readTree(orderResult.getResponse().getContentAsString())
                .path("data")
                .path("formFields");
        Map<String, String> response = new LinkedHashMap<>();
        response.put("key", fields.path("key").asText());
        response.put("txnid", fields.path("txnid").asText());
        response.put("amount", fields.path("amount").asText());
        response.put("productinfo", fields.path("productinfo").asText());
        response.put("firstname", fields.path("firstname").asText());
        response.put("email", fields.path("email").asText());
        response.put("udf1", fields.path("udf1").asText());
        response.put("udf2", fields.path("udf2").asText());
        response.put("udf3", fields.path("udf3").asText());
        response.put("udf4", fields.path("udf4").asText());
        response.put("udf5", fields.path("udf5").asText());
        response.put("status", "success");
        response.put("mihpayid", "payu_test_" + response.get("txnid"));
        response.put("hash", payuResponseHash(response));

        mockMvc.perform(post("/api/payments/payu/success")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("key", response.get("key"))
                        .param("txnid", response.get("txnid"))
                        .param("amount", response.get("amount"))
                        .param("productinfo", response.get("productinfo"))
                        .param("firstname", response.get("firstname"))
                        .param("email", response.get("email"))
                        .param("udf1", response.get("udf1"))
                        .param("udf2", response.get("udf2"))
                        .param("udf3", response.get("udf3"))
                        .param("udf4", response.get("udf4"))
                        .param("udf5", response.get("udf5"))
                        .param("status", response.get("status"))
                        .param("mihpayid", response.get("mihpayid"))
                        .param("hash", response.get("hash")))
                .andExpect(status().isFound())
                .andExpect(jsonPath("$").doesNotExist())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Location", containsString("status=paid")))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Location", containsString("verified=true")));

        mockMvc.perform(get("/api/auth/register/payu/status")
                        .param("txnid", response.get("txnid")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verified", is(true)))
                .andExpect(jsonPath("$.data.status", is("paid")))
                .andExpect(jsonPath("$.data.gatewayPaymentId", is(response.get("mihpayid"))));
    }

    @Test
    void rejectsDuplicateSignupEmailBeforeCreatingPayUOrder() throws Exception {
        long ordersBefore = paymentOrderRepository.count();

        mockMvc.perform(post("/api/auth/register/payu/order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "ankitapatil00001@gmail.com",
                                  "firstname": "Ankita Patil",
                                  "phone": "9876543210",
                                  "planName": "Starter",
                                  "amount": 1499
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("An account already exists for this admin email")));

        org.assertj.core.api.Assertions.assertThat(paymentOrderRepository.count()).isEqualTo(ordersBefore);
    }

    private static String payuResponseHash(Map<String, String> params) throws Exception {
        String hashString = "testsalt"
                + "|" + params.get("status")
                + "||||||"
                + params.get("udf5")
                + "|" + params.get("udf4")
                + "|" + params.get("udf3")
                + "|" + params.get("udf2")
                + "|" + params.get("udf1")
                + "|" + params.get("email")
                + "|" + params.get("firstname")
                + "|" + params.get("productinfo")
                + "|" + params.get("amount")
                + "|" + params.get("txnid")
                + "|" + params.get("key");
        MessageDigest digest = MessageDigest.getInstance("SHA-512");
        byte[] bytes = digest.digest(hashString.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
