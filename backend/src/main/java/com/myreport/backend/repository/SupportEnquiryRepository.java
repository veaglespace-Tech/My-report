package com.myreport.backend.repository;

import com.myreport.backend.entity.SupportEnquiry;
import com.myreport.backend.entity.enums.SupportEnquirySource;
import com.myreport.backend.entity.enums.SupportEnquiryStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportEnquiryRepository extends JpaRepository<SupportEnquiry, Long> {
    List<SupportEnquiry> findAllByOrderByCreatedAtDesc();
    long countByStatus(SupportEnquiryStatus status);
    long countBySource(SupportEnquirySource source);
}
