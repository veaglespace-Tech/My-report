package com.myreport.backend.controller;

import com.myreport.backend.dto.common.ApiResponse;
import com.myreport.backend.dto.admin.ChangePasswordRequest;
import com.myreport.backend.dto.admin.NotificationPreferenceRequest;
import com.myreport.backend.dto.superadmin.AdminRequest;
import com.myreport.backend.dto.superadmin.PlanRequest;
import com.myreport.backend.dto.superadmin.StoreCreateRequest;
import com.myreport.backend.dto.superadmin.SuperAdminProfileUpdateRequest;
import com.myreport.backend.service.SuperAdminService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(Principal principal) {
        return new ApiResponse<>(true, "SuperAdmin dashboard loaded", superAdminService.getDashboard(principal.getName()));
    }

    @GetMapping("/admins")
    public ApiResponse<Map<String, Object>> admins() {
        return new ApiResponse<>(true, "Admins loaded", superAdminService.getAdmins());
    }

    @PostMapping("/admins")
    public ApiResponse<Map<String, Object>> createAdmin(@Valid @RequestBody AdminRequest request) {
        return new ApiResponse<>(true, "Admin created", superAdminService.createAdmin(request));
    }

    @PutMapping("/admins/{adminId}")
    public ApiResponse<Map<String, Object>> updateAdmin(@PathVariable Long adminId, @Valid @RequestBody AdminRequest request) {
        return new ApiResponse<>(true, "Admin updated", superAdminService.updateAdmin(adminId, request));
    }

    @PatchMapping("/admins/{adminId}/approve")
    public ApiResponse<Map<String, Object>> approveAdmin(@PathVariable Long adminId) {
        return new ApiResponse<>(true, "Admin approved", superAdminService.approveAdmin(adminId));
    }

    @PatchMapping("/admins/{adminId}/status")
    public ApiResponse<Map<String, Object>> toggleAdminStatus(@PathVariable Long adminId) {
        return new ApiResponse<>(true, "Admin status updated", superAdminService.toggleAdminStatus(adminId));
    }

    @DeleteMapping("/admins/{adminId}")
    public ApiResponse<Object> deleteAdmin(@PathVariable Long adminId) {
        superAdminService.deleteAdmin(adminId);
        return new ApiResponse<>(true, "Admin deleted", null);
    }

    @GetMapping("/stores")
    public ApiResponse<Map<String, Object>> stores(@RequestParam(required = false) String storeType) {
        return new ApiResponse<>(true, "Stores loaded", superAdminService.getStores(storeType));
    }

    @PostMapping("/stores")
    public ApiResponse<Map<String, Object>> createStore(@Valid @RequestBody StoreCreateRequest request) {
        return new ApiResponse<>(true, "Store created", superAdminService.createStore(request));
    }

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

    @PatchMapping("/plans/{planId}/toggle")
    public ApiResponse<Map<String, Object>> togglePlan(@PathVariable Long planId) {
        return new ApiResponse<>(true, "Plan status updated", superAdminService.togglePlan(planId));
    }

    @DeleteMapping("/plans/{planId}")
    public ApiResponse<Object> deletePlan(@PathVariable Long planId) {
        superAdminService.deletePlan(planId);
        return new ApiResponse<>(true, "Plan deleted", null);
    }

    @GetMapping("/invoices")
    public ApiResponse<Map<String, Object>> invoices() {
        return new ApiResponse<>(true, "Invoices loaded", superAdminService.getInvoices());
    }

    @GetMapping("/reports")
    public ApiResponse<Map<String, Object>> reports(
            @RequestParam(required = false) String range,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        if (range != null && !range.isBlank()) {
            String normalized = range.trim().toLowerCase();
            LocalDate today = LocalDate.now();
            switch (normalized) {
                case "daily" -> {
                    startDate = today;
                    endDate = today;
                }
                case "weekly" -> {
                    startDate = today.minusDays(6);
                    endDate = today;
                }
                case "monthly" -> {
                    startDate = today.withDayOfMonth(1);
                    endDate = today;
                }
                case "yearly" -> {
                    startDate = today.withDayOfYear(1);
                    endDate = today;
                }
                default -> {
                    // Unknown range, fall back to explicit dates (if any).
                }
            }
        }
        return new ApiResponse<>(true, "Reports loaded", superAdminService.getReports(startDate, endDate));
    }

    @GetMapping("/settings")
    public ApiResponse<Map<String, Object>> settings(Principal principal) {
        return new ApiResponse<>(true, "Settings loaded", superAdminService.getSettings(principal.getName()));
    }

    @PutMapping("/settings/profile")
    public ApiResponse<Map<String, Object>> updateProfile(Principal principal, @Valid @RequestBody SuperAdminProfileUpdateRequest request) {
        return new ApiResponse<>(true, "Profile updated", superAdminService.updateProfile(principal.getName(), request));
    }

    @PostMapping("/settings/profile-photo")
    public ApiResponse<Map<String, Object>> uploadProfilePhoto(Principal principal, @RequestParam("file") MultipartFile file) {
        return new ApiResponse<>(true, "Profile photo updated", superAdminService.uploadProfilePhoto(principal.getName(), file));
    }

    @DeleteMapping("/settings/profile-photo")
    public ApiResponse<Map<String, Object>> removeProfilePhoto(Principal principal) {
        return new ApiResponse<>(true, "Profile photo removed", superAdminService.removeProfilePhoto(principal.getName()));
    }

    @PutMapping("/settings/password")
    public ApiResponse<Map<String, Object>> updatePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest request) {
        return new ApiResponse<>(true, "Password updated", superAdminService.changePassword(principal.getName(), request));
    }

    @PutMapping("/settings/preferences")
    public ApiResponse<Map<String, Object>> updatePreferences(Principal principal, @RequestBody NotificationPreferenceRequest request) {
        return new ApiResponse<>(true, "Preferences updated", superAdminService.updatePreferences(principal.getName(), request));
    }
}
