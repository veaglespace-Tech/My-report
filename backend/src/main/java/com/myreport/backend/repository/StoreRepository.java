package com.myreport.backend.repository;

import com.myreport.backend.entity.Store;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findAllByOrderByCreatedAtDesc();

    Optional<Store> findByOwnerId(Long ownerId);

    List<Store> findByPlanExpiresAtBetween(LocalDate startDate, LocalDate endDate);
}
