package com.myreport.backend.repository;

import com.myreport.backend.entity.Order;
import com.myreport.backend.entity.enums.ProductUnit;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {

    interface TopSaleProjection {
        String getName();

        Double getQuantity();

        BigDecimal getRevenue();

        ProductUnit getUnit();
    }

    @Query("""
            select o from Order o
            join fetch o.customer
            join fetch o.product
            where o.store.owner.id = :ownerId
              and o.customer.id = :customerId
            order by o.createdAt desc
            """)
    List<Order> findByOwnerAndCustomerOrderByCreatedAtDesc(@Param("ownerId") Long ownerId, @Param("customerId") Long customerId);

    @Query("""
            select o from Order o
            join fetch o.customer
            join fetch o.product
            where o.store.owner.id = :ownerId
              and o.customer.id = :customerId
              and (:start is null or o.createdAt >= :start)
              and (:end is null or o.createdAt <= :end)
            order by o.createdAt desc
            """)
    List<Order> findByOwnerAndCustomerWithDateRange(
            @Param("ownerId") Long ownerId,
            @Param("customerId") Long customerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            select o from Order o
            join fetch o.customer
            join fetch o.product
            where o.store.owner.id = :ownerId
              and (
                :query is null or :query = ''
                or lower(o.customer.fullName) like lower(concat('%', :query, '%'))
                or lower(o.product.name) like lower(concat('%', :query, '%'))
              )
              and (:start is null or o.createdAt >= :start)
              and (:end is null or o.createdAt <= :end)
            order by o.createdAt desc
            """)
    List<Order> filterOrders(
            @Param("ownerId") Long ownerId,
            @Param("query") String query,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            select
              o.product.name as name,
              sum(o.quantity) as quantity,
              sum(o.totalAmount) as revenue,
              o.product.unit as unit
            from Order o
            where o.store.owner.id = :ownerId
            group by o.product.name, o.product.unit
            order by sum(o.quantity) desc, sum(o.totalAmount) desc
            """)
    List<TopSaleProjection> findTopSalesByOwnerId(@Param("ownerId") Long ownerId);
}

