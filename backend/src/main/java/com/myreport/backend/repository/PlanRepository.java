package com.myreport.backend.repository;

import com.myreport.backend.entity.Plan;
import com.myreport.backend.entity.enums.PlanStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanRepository extends JpaRepository<Plan, Long> {

    List<Plan> findAllByOrderByCreatedAtDesc();

    Optional<Plan> findFirstByStatusOrderByMonthlyPriceAsc(PlanStatus status);
}
