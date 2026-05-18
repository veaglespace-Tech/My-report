package com.myreport.backend.service;

import com.myreport.backend.entity.Plan;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

@Service
public class PlanDateService {

    public LocalDate calculateExpiry(Plan plan, LocalDate startDate) {
        LocalDate effectiveStart = startDate == null ? LocalDate.now() : startDate;
        PlanTerm term = resolveTerm(plan);
        return switch (term.unit()) {
            case DAYS -> effectiveStart.plusDays(term.amount());
            case MONTHS -> effectiveStart.plusMonths(term.amount());
            case YEARS -> effectiveStart.plusYears(term.amount());
        };
    }

    public String displayDuration(Plan plan) {
        PlanTerm term = resolveTerm(plan);
        String unit = switch (term.unit()) {
            case DAYS -> term.amount() == 1 ? "Day" : "Days";
            case MONTHS -> term.amount() == 1 ? "Month" : "Months";
            case YEARS -> term.amount() == 1 ? "Year" : "Years";
        };
        return term.amount() + " " + unit;
    }

    public boolean isFreeTrial(Plan plan) {
        if (plan == null) {
            return false;
        }
        String name = normalize(plan.getName());
        return "FREE TRIAL".equals(name) || "FREE PLAN".equals(name) || plan.isTrialAvailable();
    }

    private PlanTerm resolveTerm(Plan plan) {
        String name = normalize(plan != null ? plan.getName() : null);
        if ("FREE TRIAL".equals(name) || "FREE PLAN".equals(name)) {
            return new PlanTerm(7, TermUnit.DAYS);
        }
        if ("STARTER".equals(name)) {
            return new PlanTerm(1, TermUnit.MONTHS);
        }
        if ("GROWTH".equals(name)) {
            return new PlanTerm(6, TermUnit.MONTHS);
        }
        if ("ENTERPRISE".equals(name)) {
            return new PlanTerm(12, TermUnit.MONTHS);
        }
        if (plan != null && plan.isTrialAvailable()) {
            return new PlanTerm(7, TermUnit.DAYS);
        }

        String duration = plan != null ? plan.getDuration() : null;
        if (duration != null && !duration.isBlank()) {
            String normalized = duration.toLowerCase().trim();
            int amount = parseAmount(normalized);
            if (normalized.contains("year")) {
                return new PlanTerm(amount > 0 ? amount : 1, TermUnit.YEARS);
            }
            if (normalized.contains("month")) {
                return new PlanTerm(amount > 0 ? amount : 1, TermUnit.MONTHS);
            }
            if (normalized.contains("day")) {
                return new PlanTerm(amount > 0 ? amount : 30, TermUnit.DAYS);
            }
        }

        return new PlanTerm(1, TermUnit.MONTHS);
    }

    private int parseAmount(String value) {
        try {
            String digits = value.replaceAll("[^0-9]", "");
            return digits.isBlank() ? 0 : Integer.parseInt(digits);
        } catch (Exception ignored) {
            return 0;
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }

    private enum TermUnit {
        DAYS,
        MONTHS,
        YEARS
    }

    private record PlanTerm(int amount, TermUnit unit) {
    }
}
