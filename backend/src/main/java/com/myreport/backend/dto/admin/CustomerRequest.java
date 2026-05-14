package com.myreport.backend.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank String fullName,
        @NotBlank(message = "Please enter a valid email address.")
        @Email(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Please enter a valid email address.")
        @Size(max = 160, message = "Please enter a valid email address.")
        String email,
        @NotBlank @Pattern(regexp = "^[0-9]{10}$") String mobileNumber,
        @NotBlank String city,
        Boolean blocked
) {
}
