package com.myreport.backend.controller;

import com.myreport.backend.dto.common.ApiResponse;
import com.myreport.backend.dto.contact.ContactRequest;
import com.myreport.backend.dto.support.ChatbotSupportRequest;
import com.myreport.backend.dto.support.SupportReplyRequest;
import com.myreport.backend.dto.support.SupportStatusRequest;
import com.myreport.backend.entity.enums.SupportEnquirySource;
import com.myreport.backend.service.SupportEnquiryService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContactController {

    private final SupportEnquiryService supportEnquiryService;

    @PostMapping({"/contact", "/contact/send", "/enquiry/send"})
    public ApiResponse<Map<String, Object>> createInquiry(@Valid @RequestBody ContactRequest request) {
        return new ApiResponse<>(true, "Enquiry sent successfully", supportEnquiryService.create(request, SupportEnquirySource.CONTACT_FORM));
    }

    @PostMapping("/support/chatbot")
    public ApiResponse<Map<String, Object>> chatbotInquiry(@Valid @RequestBody ChatbotSupportRequest request) {
        ContactRequest contactRequest = new ContactRequest();
        contactRequest.setFullName(request.name());
        contactRequest.setEmail(request.email());
        contactRequest.setPhone(request.phone() == null ? "" : request.phone());
        contactRequest.setSubject("Chatbot support escalation");
        contactRequest.setMessage(request.message());
        return new ApiResponse<>(true, "Chatbot enquiry created", supportEnquiryService.create(contactRequest, SupportEnquirySource.CHATBOT));
    }

    @GetMapping("/support/enquiries")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<Map<String, Object>> enquiries(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String q
    ) {
        return new ApiResponse<>(true, "Support enquiries loaded", supportEnquiryService.list(status, source, q));
    }

    @PostMapping("/support/reply")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<Map<String, Object>> reply(@Valid @RequestBody SupportReplyRequest request) {
        return new ApiResponse<>(true, "Reply saved", supportEnquiryService.reply(request.id(), request.replyMessage()));
    }

    @PutMapping("/support/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<Map<String, Object>> updateStatus(@Valid @RequestBody SupportStatusRequest request) {
        return new ApiResponse<>(true, "Status updated", supportEnquiryService.updateStatus(request.id(), request.status()));
    }

    @DeleteMapping("/support/delete/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<Object> delete(@PathVariable Long id) {
        supportEnquiryService.delete(id);
        return new ApiResponse<>(true, "Support enquiry deleted", null);
    }
}
