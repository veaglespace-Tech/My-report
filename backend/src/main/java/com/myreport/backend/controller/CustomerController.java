package com.myreport.backend.controller;

import com.myreport.backend.dto.common.ApiResponse;
import com.myreport.backend.dto.common.CustomerDetailsResponse;
import com.myreport.backend.dto.common.CustomerOrderRowResponse;
import com.myreport.backend.service.CustomerHistoryService;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerHistoryService customerHistoryService;

    @GetMapping("/{id}")
    public ApiResponse<CustomerDetailsResponse> getCustomer(Principal principal, @PathVariable("id") Long id) {
        return new ApiResponse<>(true, "Customer loaded", customerHistoryService.getCustomerDetails(principal.getName(), id));
    }

    @GetMapping("/{id}/orders")
    public ApiResponse<List<CustomerOrderRowResponse>> getCustomerOrders(
            Principal principal,
            @PathVariable("id") Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return new ApiResponse<>(true, "Orders loaded", customerHistoryService.getCustomerOrders(principal.getName(), id, startDate, endDate));
    }

    @GetMapping("/orders/filter")
    public ApiResponse<List<CustomerOrderRowResponse>> filterOrders(
            Principal principal,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return new ApiResponse<>(true, "Orders filtered", customerHistoryService.filterOrders(principal.getName(), name, startDate, endDate));
    }
}

