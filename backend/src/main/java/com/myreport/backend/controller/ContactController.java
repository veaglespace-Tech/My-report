package com.myreport.backend.controller;

import com.myreport.backend.dto.common.ApiResponse;
import com.myreport.backend.dto.contact.ContactRequest;
import com.myreport.backend.service.ContactService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping("/contact")
    public ApiResponse<Map<String, Object>> createInquiry(@Valid @RequestBody ContactRequest request) {
        Long id = contactService.createInquiry(request);
        return new ApiResponse<>(true, "Message Sent Successfully", Map.of("id", id));
    }
}

