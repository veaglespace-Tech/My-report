package com.myreport.backend.repository;

import com.myreport.backend.entity.PaymentOrder;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {

    Optional<PaymentOrder> findByOrderReference(String orderReference);

    Optional<PaymentOrder> findByGatewayOrderId(String gatewayOrderId);
}
