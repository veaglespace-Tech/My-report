package com.myreport.backend.repository;

import com.myreport.backend.entity.InvoiceItem;
import com.myreport.backend.entity.enums.ProductUnit;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {

    boolean existsByProductId(Long productId);

    interface TopSaleProjection {
        String getName();

        Double getQuantity();

        BigDecimal getRevenue();

        ProductUnit getUnit();
    }

    @Query("""
            select
              item.productName as name,
              sum(item.quantity) as quantity,
              sum(item.totalAmount) as revenue,
              item.unit as unit
            from InvoiceItem item
            where item.invoice.store.owner.id = :ownerId
            group by item.productName, item.unit
            order by sum(item.quantity) desc, sum(item.totalAmount) desc
            """)
    List<TopSaleProjection> findTopSalesByOwnerId(@Param("ownerId") Long ownerId);
}
