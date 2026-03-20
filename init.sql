
-- Create Categories Table
CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create Menu Table
CREATE TABLE IF NOT EXISTS menu (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES category(id)
);

-- Create Customers Table
CREATE TABLE IF NOT EXISTS customer (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_id) REFERENCES menu(id)
);

-- Insert Sample Categories
INSERT INTO category (name) VALUES 
('Starters'),
('Main Course'),
('Desserts'),
('Beverages')
ON CONFLICT DO NOTHING;

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
INSERT INTO customer (name, phone) VALUES 
('Alex', '9876543210'),
('Bob', '9876543211'),
('Johnson', '9876543212')
ON CONFLICT DO NOTHING;
