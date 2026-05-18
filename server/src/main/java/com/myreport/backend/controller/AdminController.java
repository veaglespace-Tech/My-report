package com.myreport.backend.controller;

import com.myreport.backend.dto.admin.BillingRequest;
import com.myreport.backend.dto.admin.ChangePasswordRequest;
import com.myreport.backend.dto.admin.CustomerRequest;
import com.myreport.backend.dto.admin.ProductRequest;
import com.myreport.backend.dto.admin.ProfileUpdateRequest;
import com.myreport.backend.dto.common.ApiResponse;
import com.myreport.backend.service.AdminService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard(Principal principal) {
        return new ApiResponse<>(true, "Admin dashboard loaded", adminService.getDashboard(principal.getName()));
    }

    @GetMapping("/dashboard/today-sales")
    public ApiResponse<Map<String, Object>> todaySales(Principal principal) {
        return new ApiResponse<>(true, "Today sales loaded", adminService.getTodaySales(principal.getName()));
    }

    @GetMapping("/customers")
    public ApiResponse<Map<String, Object>> customers(Principal principal) {
        return new ApiResponse<>(true, "Customers loaded", adminService.getCustomers(principal.getName()));
    }

    @PostMapping("/customers")
    public ApiResponse<Map<String, Object>> createCustomer(Principal principal, @Valid @RequestBody CustomerRequest request) {
        log.info("Received request to create customer: {}", request);
        return new ApiResponse<>(true, "Customer created", adminService.createCustomer(principal.getName(), request));
    }

    @PutMapping("/customers/{customerId}")
    public ApiResponse<Map<String, Object>> updateCustomer(Principal principal, @PathVariable Long customerId, @Valid @RequestBody CustomerRequest request) {
        return new ApiResponse<>(true, "Customer updated", adminService.updateCustomer(principal.getName(), customerId, request));
    }

    @PatchMapping("/customers/{customerId}/block")
    public ApiResponse<Map<String, Object>> toggleCustomerBlock(Principal principal, @PathVariable Long customerId) {
        return new ApiResponse<>(true, "Customer status updated", adminService.toggleCustomerBlock(principal.getName(), customerId));
    }

    @DeleteMapping("/customers/{customerId}")
    public ApiResponse<Object> deleteCustomer(Principal principal, @PathVariable Long customerId) {
        adminService.deleteCustomer(principal.getName(), customerId);
        return new ApiResponse<>(true, "Customer deleted", null);
    }

    @GetMapping("/products")
    public ApiResponse<Map<String, Object>> products(Principal principal) {
        return new ApiResponse<>(true, "Products loaded", adminService.getProducts(principal.getName()));
    }

    @PostMapping("/products")
    public ApiResponse<Map<String, Object>> createProduct(Principal principal, @Valid @RequestBody ProductRequest request) {
        return new ApiResponse<>(true, "Product created", adminService.createProduct(principal.getName(), request));
    }

    @PutMapping("/products/{productId}")
    public ApiResponse<Map<String, Object>> updateProduct(Principal principal, @PathVariable Long productId, @Valid @RequestBody ProductRequest request) {
        return new ApiResponse<>(true, "Product updated", adminService.updateProduct(principal.getName(), productId, request));
    }

    @DeleteMapping("/products/{productId}")
    public ApiResponse<Object> deleteProduct(Principal principal, @PathVariable Long productId) {
        adminService.deleteProduct(principal.getName(), productId);
        return new ApiResponse<>(true, "Product deleted", null);
    }

    @GetMapping("/invoices")
    public ApiResponse<Map<String, Object>> invoices(Principal principal) {
        return new ApiResponse<>(true, "Invoices loaded", adminService.getInvoices(principal.getName()));
    }

    @PostMapping("/billing")
    public ApiResponse<Map<String, Object>> createInvoice(Principal principal, @Valid @RequestBody BillingRequest request) {
        log.info("Received request to create invoice: {}", request);
        return new ApiResponse<>(true, "Invoice generated", adminService.createInvoice(principal.getName(), request));
    }

    @GetMapping("/my-plan")
    public ApiResponse<Map<String, Object>> myPlan(Principal principal) {
        return new ApiResponse<>(true, "Plan loaded", adminService.getPlan(principal.getName()));
    }

    @GetMapping("/reports")
    public ApiResponse<Map<String, Object>> reports(
            Principal principal,
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
        return new ApiResponse<>(true, "Reports loaded", adminService.getReports(principal.getName(), startDate, endDate));
    }

    @GetMapping("/settings")
    public ApiResponse<Map<String, Object>> settings(Principal principal) {
        return new ApiResponse<>(true, "Settings loaded", adminService.getSettings(principal.getName()));
    }

    @PutMapping("/settings/profile")
    public ApiResponse<Map<String, Object>> updateProfile(Principal principal, @Valid @RequestBody ProfileUpdateRequest request) {
        return new ApiResponse<>(true, "Profile updated", adminService.updateProfile(principal.getName(), request));
    }

    @PostMapping("/settings/profile-photo")
    public ApiResponse<Map<String, Object>> uploadProfilePhoto(Principal principal, @RequestParam("file") MultipartFile file) {
        return new ApiResponse<>(true, "Profile photo updated", adminService.uploadProfilePhoto(principal.getName(), file));
    }

    @DeleteMapping("/settings/profile-photo")
    public ApiResponse<Map<String, Object>> removeProfilePhoto(Principal principal) {
        return new ApiResponse<>(true, "Profile photo removed", adminService.removeProfilePhoto(principal.getName()));
    }

    @PutMapping("/settings/password")
    public ApiResponse<Map<String, Object>> updatePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest request) {
        return new ApiResponse<>(true, "Password updated", adminService.changePassword(principal.getName(), request));
    }

}
