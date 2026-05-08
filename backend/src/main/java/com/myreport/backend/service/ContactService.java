package com.myreport.backend.service;

import com.myreport.backend.dto.contact.ContactRequest;
import com.myreport.backend.entity.ContactInquiry;
import com.myreport.backend.repository.ContactInquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactInquiryRepository contactInquiryRepository;

    public Long createInquiry(ContactRequest request) {
        ContactInquiry inquiry = ContactInquiry.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim())
                .subject(request.getSubject().trim())
                .message(request.getMessage().trim())
                .build();

        return contactInquiryRepository.save(inquiry).getId();
    }
}

