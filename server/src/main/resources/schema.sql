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

CREATE TABLE IF NOT EXISTS invoice_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  invoice_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity DOUBLE NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  unit VARCHAR(40) DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_invoice_items_invoice_id (invoice_id),
  INDEX idx_invoice_items_product_id (product_id),
  INDEX idx_invoice_items_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  token VARCHAR(80) NOT NULL,
  expires_at DATETIME NOT NULL,
  used BIT(1) NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_password_reset_tokens_token (token),
  KEY idx_password_reset_tokens_user_id (user_id),
  CONSTRAINT fk_password_reset_tokens_user
    FOREIGN KEY (user_id) REFERENCES user_accounts (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS support_enquiries (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  ticket_id VARCHAR(120) NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  source VARCHAR(40) NOT NULL,
  message VARCHAR(4000) NOT NULL,
  status VARCHAR(20) NOT NULL,
  reply_message VARCHAR(4000) DEFAULT NULL,
  replied_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_support_enquiries_ticket_id (ticket_id),
  KEY idx_support_enquiries_status (status),
  KEY idx_support_enquiries_source (source),
  KEY idx_support_enquiries_created_at (created_at),
  KEY idx_support_enquiries_email (email)
) ENGINE=InnoDB;
