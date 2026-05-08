package com.myreport.backend.config;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseBootstrap implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseBootstrap.class);

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS orders (
                      id BIGINT NOT NULL AUTO_INCREMENT,
                      created_at DATETIME NOT NULL,
                      updated_at DATETIME NOT NULL,
                      customer_id BIGINT NOT NULL,
                      product_id BIGINT NOT NULL,
                      store_id BIGINT NOT NULL,
                      quantity DOUBLE NOT NULL,
                      price DECIMAL(10,2) NOT NULL,
                      total_amount DECIMAL(12,2) NOT NULL,
                      PRIMARY KEY (id),
                      KEY idx_orders_store_id (store_id),
                      KEY idx_orders_customer_id (customer_id),
                      KEY idx_orders_product_id (product_id),
                      KEY idx_orders_created_at (created_at)
                    )
                    """);
        } catch (Exception e) {
            logger.warn("Orders table bootstrap skipped: {}", e.getMessage());
        }
    }
}
