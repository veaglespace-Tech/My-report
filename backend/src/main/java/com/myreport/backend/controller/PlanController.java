package com.myreport.backend.controller;

import com.myreport.backend.entity.Plan;
import com.myreport.backend.entity.enums.PlanStatus;
import com.myreport.backend.repository.PlanRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanRepository planRepository;

    @GetMapping
    public ResponseEntity<List<Plan>> plans() {
        List<Plan> plans = planRepository.findAllByStatusOrderByCreatedAtDesc(PlanStatus.ACTIVE);
        return ResponseEntity.ok(plans);
    }
}
