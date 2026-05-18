package com.myreport.backend.repository;

import com.myreport.backend.entity.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStoreOwnerIdOrderByCreatedAtDesc(Long ownerId);

    long countByStoreOwnerId(Long ownerId);
}
