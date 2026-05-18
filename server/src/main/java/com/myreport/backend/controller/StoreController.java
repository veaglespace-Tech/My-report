package com.myreport.backend.controller;

import com.myreport.backend.dto.common.ApiResponse;
import com.myreport.backend.service.SuperAdminService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final SuperAdminService superAdminService;

    @GetMapping
    public ApiResponse<Map<String, Object>> stores(@RequestParam(required = false) String storeType) {
        return new ApiResponse<>(true, "Stores loaded", superAdminService.getStores(storeType));
    }
}

