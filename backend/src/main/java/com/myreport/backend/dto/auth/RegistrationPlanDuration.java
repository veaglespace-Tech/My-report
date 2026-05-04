package com.myreport.backend.dto.auth;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RegistrationPlanDuration {
    TRIAL("TRIAL"),
    THREE_MONTHS("3_MONTHS"),
    SIX_MONTHS("6_MONTHS"),
    TWELVE_MONTHS("12_MONTHS");

    private final String value;

    RegistrationPlanDuration(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static RegistrationPlanDuration fromValue(String value) {
        for (RegistrationPlanDuration item : values()) {
            if (item.value.equalsIgnoreCase(value)) {
                return item;
            }
        }
        throw new IllegalArgumentException("Unsupported registration plan: " + value);
    }
}
