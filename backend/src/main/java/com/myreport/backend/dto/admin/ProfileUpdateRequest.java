package com.myreport.backend.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @NotBlank String fullName,
        @NotBlank @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be exactly 10 digits") String mobileNumber,
        @NotBlank String city,
        @NotBlank @Size(min = 10, message = "Address must be at least 10 characters") @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\s).{10,}$", message = "Please enter a full address") String address,
        @NotBlank String storeName
) {
}
