CREATE TYPE roleenum AS ENUM ('ADMIN', 'MANAGER', 'STAFF')
;

CREATE TABLE users (
	id SERIAL NOT NULL, 
	username VARCHAR, 
	email VARCHAR, 
	hashed_password VARCHAR, 
	role roleenum, 
	PRIMARY KEY (id)
)


;
CREATE UNIQUE INDEX ix_users_email ON users (email)
;
CREATE UNIQUE INDEX ix_users_username ON users (username)
;
CREATE INDEX ix_users_id ON users (id)
;

CREATE TABLE categories (
	id SERIAL NOT NULL, 
	name VARCHAR, 
	PRIMARY KEY (id)
)


;
CREATE INDEX ix_categories_id ON categories (id)
;
CREATE UNIQUE INDEX ix_categories_name ON categories (name)
;

CREATE TABLE uom (
	id SERIAL NOT NULL, 
	name VARCHAR, 
	PRIMARY KEY (id)
)


;
CREATE INDEX ix_uom_id ON uom (id)
;
CREATE UNIQUE INDEX ix_uom_name ON uom (name)
;

CREATE TABLE suppliers (
	id SERIAL NOT NULL, 
	name VARCHAR, 
	contact_email VARCHAR, 
	PRIMARY KEY (id)
)


;
CREATE INDEX ix_suppliers_id ON suppliers (id)
;
CREATE INDEX ix_suppliers_name ON suppliers (name)
;

CREATE TABLE warehouses (
	id SERIAL NOT NULL, 
	name VARCHAR, 
	address VARCHAR, 
	PRIMARY KEY (id)
)


;
CREATE INDEX ix_warehouses_name ON warehouses (name)
;
CREATE INDEX ix_warehouses_id ON warehouses (id)
;

CREATE TABLE deliveries (
	id SERIAL NOT NULL, 
	customer_name VARCHAR, 
	status VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
)


;
CREATE INDEX ix_deliveries_id ON deliveries (id)
;

CREATE TABLE notifications (
	id SERIAL NOT NULL, 
	message VARCHAR, 
	is_read BOOLEAN, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
)


;
CREATE INDEX ix_notifications_id ON notifications (id)
;

CREATE TABLE products (
	id SERIAL NOT NULL, 
	sku VARCHAR, 
	name VARCHAR, 
	category_id INTEGER, 
	uom_id INTEGER, 
	price FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(category_id) REFERENCES categories (id), 
	FOREIGN KEY(uom_id) REFERENCES uom (id)
)


;
CREATE UNIQUE INDEX ix_products_sku ON products (sku)
;
CREATE INDEX ix_products_id ON products (id)
;
CREATE INDEX ix_products_name ON products (name)
;

CREATE TABLE locations (
	id SERIAL NOT NULL, 
	warehouse_id INTEGER, 
	name VARCHAR, 
	type VARCHAR, 
	PRIMARY KEY (id), 
	FOREIGN KEY(warehouse_id) REFERENCES warehouses (id)
)


;
CREATE INDEX ix_locations_id ON locations (id)
;

CREATE TABLE receipts (
	id SERIAL NOT NULL, 
	supplier_id INTEGER, 
	status VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(supplier_id) REFERENCES suppliers (id)
)


;
CREATE INDEX ix_receipts_id ON receipts (id)
;

CREATE TABLE audit_logs (
	id SERIAL NOT NULL, 
	user_id INTEGER, 
	action VARCHAR, 
	entity VARCHAR, 
	entity_id INTEGER, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
)


;
CREATE INDEX ix_audit_logs_id ON audit_logs (id)
;

CREATE TABLE receipt_items (
	id SERIAL NOT NULL, 
	receipt_id INTEGER, 
	product_id INTEGER, 
	quantity INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(receipt_id) REFERENCES receipts (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
)


;
CREATE INDEX ix_receipt_items_id ON receipt_items (id)
;

CREATE TABLE delivery_items (
	id SERIAL NOT NULL, 
	delivery_id INTEGER, 
	product_id INTEGER, 
	quantity INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(delivery_id) REFERENCES deliveries (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
)


;
CREATE INDEX ix_delivery_items_id ON delivery_items (id)
;

CREATE TABLE transfers (
	id SERIAL NOT NULL, 
	source_location_id INTEGER, 
	destination_location_id INTEGER, 
	status VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(source_location_id) REFERENCES locations (id), 
	FOREIGN KEY(destination_location_id) REFERENCES locations (id)
)


;
CREATE INDEX ix_transfers_id ON transfers (id)
;

CREATE TABLE adjustments (
	id SERIAL NOT NULL, 
	location_id INTEGER, 
	status VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(location_id) REFERENCES locations (id)
)


;
CREATE INDEX ix_adjustments_id ON adjustments (id)
;

CREATE TABLE stock_ledger (
	id SERIAL NOT NULL, 
	product_id INTEGER, 
	location_id INTEGER, 
	operation_type VARCHAR, 
	quantity INTEGER, 
	reference_id VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(product_id) REFERENCES products (id), 
	FOREIGN KEY(location_id) REFERENCES locations (id)
)


;
CREATE INDEX ix_stock_ledger_id ON stock_ledger (id)
;

CREATE TABLE stock_balances (
	id SERIAL NOT NULL, 
	product_id INTEGER, 
	location_id INTEGER, 
	quantity INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(product_id) REFERENCES products (id), 
	FOREIGN KEY(location_id) REFERENCES locations (id)
)


;
CREATE INDEX ix_stock_balances_id ON stock_balances (id)
;

CREATE TABLE reorder_rules (
	id SERIAL NOT NULL, 
	product_id INTEGER, 
	location_id INTEGER, 
	min_quantity INTEGER, 
	reorder_quantity INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(product_id) REFERENCES products (id), 
	FOREIGN KEY(location_id) REFERENCES locations (id)
)


;
CREATE INDEX ix_reorder_rules_id ON reorder_rules (id)
;

CREATE TABLE transfer_items (
	id SERIAL NOT NULL, 
	transfer_id INTEGER, 
	product_id INTEGER, 
	quantity INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(transfer_id) REFERENCES transfers (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
)


;
CREATE INDEX ix_transfer_items_id ON transfer_items (id)
;

CREATE TABLE adjustment_items (
	id SERIAL NOT NULL, 
	adjustment_id INTEGER, 
	product_id INTEGER, 
	counted_quantity INTEGER, 
	theoretical_quantity INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(adjustment_id) REFERENCES adjustments (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
)


;
CREATE INDEX ix_adjustment_items_id ON adjustment_items (id)
;
