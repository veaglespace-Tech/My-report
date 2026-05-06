package com.myreport.backend.repository;

import com.myreport.backend.entity.Order;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
            select o from Order o
            where o.store.owner.id = :ownerId
              and o.customer.id = :customerId
            order by o.createdAt desc
            """)
    List<Order> findByOwnerAndCustomerOrderByCreatedAtDesc(@Param("ownerId") Long ownerId, @Param("customerId") Long customerId);

    @Query("""
            select o from Order o
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
            where o.store.owner.id = :ownerId
              and (:name is null or :name = '' or lower(o.customer.fullName) like lower(concat('%', :name, '%')))
              and (:start is null or o.createdAt >= :start)
              and (:end is null or o.createdAt <= :end)
            order by o.createdAt desc
            """)
    List<Order> filterOrders(
            @Param("ownerId") Long ownerId,
            @Param("name") String name,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}

