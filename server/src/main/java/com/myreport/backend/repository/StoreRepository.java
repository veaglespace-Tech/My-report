package com.myreport.backend.repository;

import com.myreport.backend.entity.Store;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findAllByOrderByCreatedAtDesc();

    List<Store> findAllByStoreTypeIgnoreCaseOrderByCreatedAtDesc(String storeType);

    Optional<Store> findByOwnerId(Long ownerId);

    Optional<Store> findByStoreCodeIgnoreCase(String storeCode);

    boolean existsByStoreCode(String storeCode);

    List<Store> findByPlanExpiresAtBetween(LocalDate startDate, LocalDate endDate);
}
