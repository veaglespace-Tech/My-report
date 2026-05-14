package com.myreport.backend.repository;

import com.myreport.backend.entity.Invoice;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findAllByOrderByCreatedAtDesc();

    List<Invoice> findByStoreOwnerIdOrderByCreatedAtDesc(Long ownerId);

    @Query("""
            select coalesce(sum(invoice.totalAmount), 0)
            from Invoice invoice
            where invoice.store.owner.id = :ownerId
              and invoice.createdAt >= :start
              and invoice.createdAt < :end
            """)
    BigDecimal sumTotalAmountByOwnerIdAndCreatedAtBetween(
            @Param("ownerId") Long ownerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
