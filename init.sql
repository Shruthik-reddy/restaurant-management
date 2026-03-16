-- Restaurant Management System - PostgreSQL Initialization Script

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Create Menu Table
CREATE TABLE IF NOT EXISTS menu (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id)
);

-- Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    menu_id INTEGER REFERENCES menu(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Insert Sample Categories
INSERT INTO categories (name) VALUES 
('Starters'),
('Main Course'),
('Desserts'),
('Beverages')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Menu Items
INSERT INTO menu (name, price, category_id) VALUES 
('Samosa', 30.00, 1),
('Paneer Tikka', 120.00, 1),
('Butter Chicken', 180.00, 2),
('Biryani', 150.00, 2),
('Ice Cream', 60.00, 3),
('Lassi', 40.00, 4)
ON CONFLICT DO NOTHING;

-- Insert Sample Customers
INSERT INTO customers (name, phone) VALUES 
('John Doe', '9876543210'),
('Jane Smith', '9876543211'),
('Bob Johnson', '9876543212')
ON CONFLICT (phone) DO NOTHING;

-- Create Indexes for Better Performance
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu ON order_items(menu_id);
