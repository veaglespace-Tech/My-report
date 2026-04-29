package com.myreport.backend.repository;

import com.myreport.backend.entity.Invoice;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findAllByOrderByCreatedAtDesc();

    List<Invoice> findByStoreOwnerIdOrderByCreatedAtDesc(Long ownerId);
}
