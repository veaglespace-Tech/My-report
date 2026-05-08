-- Creates missing tables for fresh MySQL databases.
-- Safe to run repeatedly (uses IF NOT EXISTS).

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
  INDEX idx_orders_store_id (store_id),
  INDEX idx_orders_customer_id (customer_id),
  INDEX idx_orders_product_id (product_id),
  INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB;
