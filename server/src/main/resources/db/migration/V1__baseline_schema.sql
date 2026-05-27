CREATE TABLE IF NOT EXISTS user_accounts (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  gender VARCHAR(255) DEFAULT NULL,
  role VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  city VARCHAR(255) DEFAULT NULL,
  address VARCHAR(600) DEFAULT NULL,
  store_name VARCHAR(255) DEFAULT NULL,
  avatar_url VARCHAR(255) DEFAULT NULL,
  low_stock_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  plan_expiry_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  payment_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_accounts_email (email),
  INDEX idx_user_accounts_role_created_at (role, created_at)
);

CREATE TABLE IF NOT EXISTS plans (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(600) NOT NULL,
  monthly_price DECIMAL(12,2) NOT NULL,
  yearly_price DECIMAL(12,2) NOT NULL,
  max_products INT NOT NULL,
  max_customers INT NOT NULL,
  features VARCHAR(1000) DEFAULT NULL,
  duration VARCHAR(80) DEFAULT NULL,
  price DECIMAL(12,2) DEFAULT NULL,
  max_users INT DEFAULT NULL,
  trial_available BOOLEAN NOT NULL DEFAULT FALSE,
  popular BOOLEAN NOT NULL DEFAULT FALSE,
  button_text VARCHAR(40) DEFAULT NULL,
  theme_color VARCHAR(40) DEFAULT NULL,
  status VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_plans_name (name),
  INDEX idx_plans_status_created_at (status, created_at)
);

CREATE TABLE IF NOT EXISTS stores (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  name VARCHAR(255) NOT NULL,
  store_code VARCHAR(32) DEFAULT NULL,
  store_type VARCHAR(255) DEFAULT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) DEFAULT NULL,
  country VARCHAR(255) DEFAULT NULL,
  business_email VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(255) DEFAULT NULL,
  address VARCHAR(600) NOT NULL,
  status VARCHAR(255) NOT NULL,
  plan_expires_at DATE NOT NULL,
  plan_started_at DATE DEFAULT NULL,
  owner_id BIGINT DEFAULT NULL,
  plan_id BIGINT DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_stores_store_code (store_code),
  INDEX idx_stores_owner_id (owner_id),
  INDEX idx_stores_plan_id (plan_id),
  INDEX idx_stores_store_type_created_at (store_type, created_at),
  INDEX idx_stores_plan_expires_at (plan_expires_at),
  CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES user_accounts (id) ON DELETE SET NULL,
  CONSTRAINT fk_stores_plan FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS products (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity DOUBLE NOT NULL,
  unit VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  store_id BIGINT DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_products_store_id_created_at (store_id, created_at),
  CONSTRAINT fk_products_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  mobile_number VARCHAR(255) NOT NULL,
  city VARCHAR(255) DEFAULT NULL,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  total_spent DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  purchase_count INT NOT NULL DEFAULT 0,
  store_id BIGINT DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_customers_store_id_created_at (store_id, created_at),
  INDEX idx_customers_mobile_number (mobile_number),
  CONSTRAINT fk_customers_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  invoice_number VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(255) NOT NULL,
  notes VARCHAR(1200) DEFAULT NULL,
  store_id BIGINT DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_invoices_invoice_number (invoice_number),
  INDEX idx_invoices_store_id_created_at (store_id, created_at),
  INDEX idx_invoices_status (status),
  CONSTRAINT fk_invoices_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  title VARCHAR(255) NOT NULL,
  message VARCHAR(800) NOT NULL,
  type VARCHAR(255) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  user_id BIGINT DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_notifications_user_id_created_at (user_id, created_at),
  INDEX idx_notifications_is_read (is_read),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES user_accounts (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_orders (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  order_reference VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL,
  payment_gateway VARCHAR(255) NOT NULL,
  gateway_order_id VARCHAR(255) DEFAULT NULL,
  gateway_payment_id VARCHAR(255) DEFAULT NULL,
  gateway_signature VARCHAR(255) DEFAULT NULL,
  metadata_json VARCHAR(1600) DEFAULT NULL,
  admin_id BIGINT DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_payment_orders_order_reference (order_reference),
  INDEX idx_payment_orders_admin_id (admin_id),
  INDEX idx_payment_orders_gateway_order_id (gateway_order_id),
  INDEX idx_payment_orders_created_at (created_at),
  CONSTRAINT fk_payment_orders_admin FOREIGN KEY (admin_id) REFERENCES user_accounts (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  token VARCHAR(80) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_password_reset_tokens_token (token),
  INDEX idx_password_reset_tokens_user_id (user_id),
  INDEX idx_password_reset_tokens_expires_at (expires_at),
  CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES user_accounts (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_enquiries (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  ticket_id VARCHAR(120) NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  source VARCHAR(40) NOT NULL,
  message VARCHAR(4000) NOT NULL,
  status VARCHAR(20) NOT NULL,
  reply_message VARCHAR(4000) DEFAULT NULL,
  replied_at TIMESTAMP DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_support_enquiries_ticket_id (ticket_id),
  INDEX idx_support_enquiries_status (status),
  INDEX idx_support_enquiries_source (source),
  INDEX idx_support_enquiries_created_at (created_at),
  INDEX idx_support_enquiries_email (email)
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  subject VARCHAR(160) NOT NULL,
  message VARCHAR(4000) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_contact_inquiries_created_at (created_at),
  INDEX idx_contact_inquiries_email (email)
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  customer_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  store_id BIGINT NOT NULL,
  quantity DOUBLE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_orders_store_customer_created_at (store_id, customer_id, created_at),
  INDEX idx_orders_product_id (product_id),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_store FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  invoice_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity DOUBLE NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  unit VARCHAR(40) DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_invoice_items_invoice_id_created_at (invoice_id, created_at),
  INDEX idx_invoice_items_product_id (product_id),
  CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
  CONSTRAINT fk_invoice_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
