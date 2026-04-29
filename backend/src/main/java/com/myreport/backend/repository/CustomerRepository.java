package com.myreport.backend.repository;

import com.myreport.backend.entity.Customer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByStoreOwnerIdOrderByCreatedAtDesc(Long ownerId);

    long countByStoreOwnerId(Long ownerId);
}
