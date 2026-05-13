package com.myreport.backend.service;

import com.myreport.backend.dto.contact.ContactRequest;
import com.myreport.backend.entity.SupportEnquiry;
import com.myreport.backend.entity.enums.SupportEnquirySource;
import com.myreport.backend.entity.enums.SupportEnquiryStatus;
import com.myreport.backend.exception.ApiException;
import com.myreport.backend.repository.SupportEnquiryRepository;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupportEnquiryService {

    private final SupportEnquiryRepository repository;

    @Transactional
    public Map<String, Object> create(ContactRequest request, SupportEnquirySource source) {
        SupportEnquiry enquiry = SupportEnquiry.builder()
                .ticketId(buildTicketId())
                .name(clean(request.getFullName()))
                .email(clean(request.getEmail()).toLowerCase())
                .phone(clean(request.getPhone()))
                .source(source)
                .message(clean(request.getMessage()))
                .status(SupportEnquiryStatus.NEW)
                .build();
        repository.save(enquiry);
        return map(enquiry);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> list(String status, String source, String query) {
        String search = query == null ? "" : query.trim().toLowerCase();
        SupportEnquiryStatus statusFilter = parseStatus(status);
        SupportEnquirySource sourceFilter = parseSource(source);

        List<Map<String, Object>> items = repository.findAllByOrderByCreatedAtDesc().stream()
                .filter(item -> statusFilter == null || item.getStatus() == statusFilter)
                .filter(item -> sourceFilter == null || item.getSource() == sourceFilter)
                .filter(item -> search.isBlank() || matches(item, search))
                .map(this::map)
                .toList();

        long total = repository.count();
        long newCount = repository.countByStatus(SupportEnquiryStatus.NEW);
        long inProgressCount = repository.countByStatus(SupportEnquiryStatus.IN_PROGRESS);
        long resolvedCount = repository.countByStatus(SupportEnquiryStatus.RESOLVED);
        long emailSentCount = repository.findAllByOrderByCreatedAtDesc().stream().filter(item -> item.getReplyMessage() != null && !item.getReplyMessage().isBlank()).count();

        return Map.of(
                "items", items,
                "total", total,
                "stats", Map.of(
                        "newCount", newCount,
                        "inProgressCount", inProgressCount,
                        "resolvedCount", resolvedCount,
                        "emailSentCount", emailSentCount
                )
        );
    }

    @Transactional
    public Map<String, Object> reply(Long id, String replyMessage) {
        SupportEnquiry enquiry = getRequired(id);
        enquiry.setReplyMessage(replyMessage.trim());
        enquiry.setStatus(SupportEnquiryStatus.IN_PROGRESS);
        enquiry.setRepliedAt(LocalDateTime.now());
        repository.save(enquiry);
        return map(enquiry);
    }

    @Transactional
    public Map<String, Object> updateStatus(Long id, SupportEnquiryStatus status) {
        SupportEnquiry enquiry = getRequired(id);
        enquiry.setStatus(status);
        repository.save(enquiry);
        return map(enquiry);
    }

    @Transactional
    public void delete(Long id) {
        SupportEnquiry enquiry = getRequired(id);
        repository.delete(enquiry);
    }

    private boolean matches(SupportEnquiry item, String search) {
        return String.join(" ",
                safe(item.getTicketId()),
                safe(item.getName()),
                safe(item.getEmail()),
                safe(item.getPhone()),
                safe(item.getMessage()))
                .toLowerCase()
                .contains(search);
    }

    private SupportEnquiry getRequired(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Support enquiry not found"));
    }

    private Map<String, Object> map(SupportEnquiry enquiry) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", enquiry.getId());
        data.put("ticketId", enquiry.getTicketId());
        data.put("name", enquiry.getName());
        data.put("email", enquiry.getEmail());
        data.put("phone", enquiry.getPhone());
        data.put("source", enquiry.getSource());
        data.put("message", enquiry.getMessage());
        data.put("status", enquiry.getStatus());
        data.put("replyMessage", enquiry.getReplyMessage());
        data.put("repliedAt", enquiry.getRepliedAt());
        data.put("createdAt", enquiry.getCreatedAt());
        data.put("updatedAt", enquiry.getUpdatedAt());
        return data;
    }

    private String buildTicketId() {
        return "SUP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private SupportEnquiryStatus parseStatus(String value) {
        if (value == null || value.isBlank() || value.equalsIgnoreCase("all")) return null;
        try {
            return SupportEnquiryStatus.valueOf(value.toUpperCase());
        } catch (Exception ignored) {
            return null;
        }
    }

    private SupportEnquirySource parseSource(String value) {
        if (value == null || value.isBlank() || value.equalsIgnoreCase("all")) return null;
        try {
            return SupportEnquirySource.valueOf(value.toUpperCase());
        } catch (Exception ignored) {
            return null;
        }
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
