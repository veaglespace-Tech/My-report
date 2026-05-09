package com.myreport.backend.config;

import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StartupDiagnostics implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(StartupDiagnostics.class);

    private final Environment environment;

    @Override
    public void run(ApplicationArguments args) {
        String[] activeProfiles = environment.getActiveProfiles();
        String profiles = activeProfiles.length == 0 ? "(default)" : Arrays.toString(activeProfiles);
        String datasourceUrl = environment.getProperty("spring.datasource.url");
        boolean razorpayConfigured = hasText(environment.getProperty("razorpay.key-id"))
                && hasText(environment.getProperty("razorpay.key-secret"));
        logger.info("Active profiles: {}", profiles);
        logger.info("Datasource URL: {}", datasourceUrl);
        logger.info("Razorpay configured: {}", razorpayConfigured);
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
