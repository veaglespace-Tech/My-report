package com.myreport.backend.controller;

import com.myreport.backend.dto.common.ApiResponse;
import com.myreport.backend.dto.superadmin.PlanRequest;
import com.myreport.backend.service.SuperAdminService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class SuperadminPlanController {

    private final SuperAdminService superAdminService;

    @GetMapping("/plans")
    public ApiResponse<Map<String, Object>> plans() {
        return new ApiResponse<>(true, "Plans loaded", superAdminService.getPlans());
    }

    @PostMapping("/plans")
    public ApiResponse<Map<String, Object>> createPlan(@Valid @RequestBody PlanRequest request) {
        return new ApiResponse<>(true, "Plan created", superAdminService.createPlan(request));
    }

    @PutMapping("/plans/{planId}")
    public ApiResponse<Map<String, Object>> updatePlan(@PathVariable Long planId, @Valid @RequestBody PlanRequest request) {
        return new ApiResponse<>(true, "Plan updated", superAdminService.updatePlan(planId, request));
    }

    @DeleteMapping("/plans/{planId}")
    public ApiResponse<Object> deletePlan(@PathVariable Long planId) {
        superAdminService.deletePlan(planId);
        return new ApiResponse<>(true, "Plan deleted", null);
    }
}

