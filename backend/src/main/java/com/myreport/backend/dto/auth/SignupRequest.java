package com.myreport.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be 10 digits") String mobileNumber,
        @NotBlank @Size(min = 8, message = "Password must contain at least 8 characters") String password,
        @NotBlank String confirmPassword,
        @NotBlank String storeName,
        @NotBlank String city,
        @NotBlank String address,
        @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be 6 digits") String otp
) {
}
