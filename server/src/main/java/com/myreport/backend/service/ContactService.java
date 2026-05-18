package com.myreport.backend.service;

import com.myreport.backend.dto.contact.ContactRequest;
import com.myreport.backend.entity.ContactInquiry;
import com.myreport.backend.repository.ContactInquiryRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactInquiryRepository contactInquiryRepository;

    public Long createInquiry(ContactRequest request) {
        ContactInquiry inquiry = ContactInquiry.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim())
                .phone(request.getPhone().trim())
                .subject(request.getSubject().trim())
                .message(request.getMessage() == null ? "" : request.getMessage().trim())
                .build();

        return contactInquiryRepository.save(inquiry).getId();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInquiries() {
        List<Map<String, Object>> items = contactInquiryRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapInquiry)
                .toList();
        return Map.of("items", items, "total", items.size());
    }

    private Map<String, Object> mapInquiry(ContactInquiry inquiry) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", inquiry.getId());
        data.put("fullName", inquiry.getFullName());
        data.put("email", inquiry.getEmail());
        data.put("phone", inquiry.getPhone());
        data.put("subject", inquiry.getSubject());
        data.put("message", inquiry.getMessage());
        data.put("createdAt", inquiry.getCreatedAt());
        return data;
    }
}

