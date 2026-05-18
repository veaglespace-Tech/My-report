package com.myreport.backend.dto.contact;

import jakarta.validation.constraints.AssertTrue;
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
    @Size(min = 3, max = 60, message = "Full name must be between 3 and 60 characters")
    @Pattern(regexp = "^[A-Za-z][A-Za-z .'-]*[A-Za-z]$", message = "Full name must contain a valid name")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(regexp = "^(?!.*\\.\\.)(?!.*\\s)[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.)+com$", message = "Email must be a valid .com address")
    @Size(max = 160, message = "Email must be at most 160 characters")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be exactly 10 digits")
    @Size(min = 10, max = 10, message = "Phone must be exactly 10 digits")
    private String phone;

    @NotBlank(message = "Subject is required")
    @Size(min = 5, max = 120, message = "Subject must be between 5 and 120 characters")
    private String subject;

    @NotBlank(message = "Inquiry Message is required")
    @Size(min = 10, max = 1000, message = "Message must be between 10 and 1000 characters")
    private String message;

    @AssertTrue(message = "Full name must contain a valid name")
    public boolean isFullNameAccepted() {
        return !isDummyText(fullName);
    }

    @AssertTrue(message = "Phone must be a valid 10 digit number")
    public boolean isPhoneAccepted() {
        if (phone == null || phone.isBlank()) {
            return true;
        }
        return !phone.trim().matches("^(\\d)\\1{9}$");
    }

    @AssertTrue(message = "Subject must contain meaningful details")
    public boolean isSubjectAccepted() {
        return !isDummyText(subject);
    }

    @AssertTrue(message = "Message must contain meaningful details")
    public boolean isMessageAccepted() {
        return !isDummyText(message);
    }

    private boolean isDummyText(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        String compact = value.trim().toLowerCase().replaceAll("[^a-z0-9]", "");
        return !compact.isBlank() && compact.chars().distinct().count() == 1;
    }
}

