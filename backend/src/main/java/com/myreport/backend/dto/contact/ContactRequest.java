package com.myreport.backend.dto.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Full name must be at most 120 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Size(max = 160, message = "Email must be at most 160 characters")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone must be 10 to 15 digits")
    @Size(max = 15, message = "Phone must be at most 15 characters")
    private String phone;

    @NotBlank(message = "Subject is required")
    @Size(max = 160, message = "Subject must be at most 160 characters")
    private String subject;

    @NotBlank(message = "Inquiry Message is required")
    @Size(max = 4000, message = "Message must be at most 4000 characters")
    private String message;
}

