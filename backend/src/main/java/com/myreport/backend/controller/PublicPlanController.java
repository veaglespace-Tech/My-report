package com.myreport.backend.controller;

import com.myreport.backend.dto.common.ApiResponse;
import com.myreport.backend.entity.Plan;
import com.myreport.backend.entity.enums.PlanStatus;
import com.myreport.backend.repository.PlanRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicPlanController {

    private final PlanRepository planRepository;

    @GetMapping("/plans")
    public ApiResponse<Map<String, Object>> plans() {
        List<Map<String, Object>> items = planRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(plan -> plan.getStatus() == PlanStatus.ACTIVE)
                .map(this::mapPlan)
                .toList();
        return new ApiResponse<>(true, "Plans loaded", Map.of("items", items));
    }

    private Map<String, Object> mapPlan(Plan plan) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", plan.getId());
        data.put("name", plan.getName());
        data.put("planName", plan.getName());
        data.put("duration", plan.getDuration());
        data.put("price", plan.getPrice());
        data.put("description", plan.getDescription());
        data.put("monthlyPrice", plan.getMonthlyPrice());
        data.put("yearlyPrice", plan.getYearlyPrice());
        data.put("maxProducts", plan.getMaxProducts());
        data.put("maxUsers", plan.getMaxUsers());
        data.put("maxCustomers", plan.getMaxCustomers());
        data.put("features", plan.getFeatures());
        data.put("trialAvailable", plan.isTrialAvailable());
        data.put("popular", plan.isPopular());
        data.put("buttonText", plan.getButtonText());
        data.put("themeColor", plan.getThemeColor());
        data.put("status", plan.getStatus());
        return data;
    }
}
