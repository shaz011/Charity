-- Charity Application Database Schema
-- Run this in your Supabase SQL editor or PostgreSQL database

-- Enable UUID extension for generating IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'pack')),
    sale_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (sale_price >= 0),
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    buying_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    weight_before_sale DECIMAL(10,2) NOT NULL CHECK (weight_before_sale > 0), -- Weight of item + container before sale
    weight_after_sale DECIMAL(10,2) NOT NULL CHECK (weight_after_sale >= 0), -- Weight of item + container after sale
    weight DECIMAL(10,2) NOT NULL CHECK (weight > 0), -- Actual weight sold (weight_before_sale - weight_after_sale)
    price_per_kg DECIMAL(10,2) NOT NULL CHECK (price_per_kg >= 0),
    expected_cash DECIMAL(10,2) NOT NULL CHECK (expected_cash >= 0),
    received_cash DECIMAL(10,2) NOT NULL CHECK (received_cash >= 0),
    sale_date DATE NOT NULL,
    topup DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (topup >= 0),
    charity DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (charity >= 0), -- Charity amount to be added to arrears
    credit DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (credit >= 0), -- Credit amount to be added to total received
    arrears DECIMAL(10,2) NOT NULL CHECK (arrears >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- General Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- Now allows any string, not just predefined items
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'pack', 'piece', 'liter', 'dozen', 'gram', 'bottle', 'packet')),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    weight DECIMAL(10,2) CHECK (weight >= 0), -- Optional weight in kg
    expense_date DATE NOT NULL,
    notes TEXT, -- Optional notes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Items table for user-defined items in General Expenses
CREATE TABLE IF NOT EXISTS custom_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE, -- User-defined item name, must be unique
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'pack', 'piece', 'liter', 'dozen', 'gram', 'bottle', 'packet')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Products table for user-defined products
CREATE TABLE IF NOT EXISTS custom_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE, -- User-defined product name, must be unique
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'pack')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Misc Expenses table - for custom user-defined expenses
CREATE TABLE IF NOT EXISTS misc_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- User can enter any name
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    expense_date DATE NOT NULL,
    notes TEXT, -- Optional notes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_buying_date ON products(buying_date);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

-- Indexes for expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_name ON expenses(name);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);

-- Indexes for custom_items table
CREATE INDEX IF NOT EXISTS idx_custom_items_name ON custom_items(name);
CREATE INDEX IF NOT EXISTS idx_custom_items_created_at ON custom_items(created_at);

-- Indexes for misc_expenses table
CREATE INDEX IF NOT EXISTS idx_misc_expenses_name ON misc_expenses(name);
CREATE INDEX IF NOT EXISTS idx_misc_expenses_expense_date ON misc_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_misc_expenses_created_at ON misc_expenses(created_at);

-- Item Consumption table - for tracking what items are consumed daily
CREATE TABLE IF NOT EXISTS consumed_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(100) NOT NULL, -- Name of the item consumed
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'pack', 'piece', 'liter', 'dozen', 'gram', 'bottle', 'packet')),
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0), -- Quantity consumed
    weight DECIMAL(10,2) CHECK (weight >= 0), -- Optional weight in kg if applicable
    price DECIMAL(10,2) CHECK (price >= 0), -- Price per unit from the source item
    consumption_date DATE NOT NULL, -- Date when item was consumed
    notes TEXT, -- Optional notes about consumption
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('general_expense', 'custom_item')), -- Where the item came from
    source_id UUID, -- ID of the source expense or custom item
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for consumed_items table
CREATE INDEX IF NOT EXISTS idx_consumed_items_item_name ON consumed_items(item_name);
CREATE INDEX IF NOT EXISTS idx_consumed_items_consumption_date ON consumed_items(consumption_date);
CREATE INDEX IF NOT EXISTS idx_consumed_items_source_type ON consumed_items(source_type);
CREATE INDEX IF NOT EXISTS idx_consumed_items_created_at ON consumed_items(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at 
    BEFORE UPDATE ON sales 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for expenses table
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_expenses_updated_at();

-- Triggers for custom_items table
CREATE OR REPLACE FUNCTION update_custom_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_items_updated_at
    BEFORE UPDATE ON custom_items
    FOR EACH ROW
    EXECUTE FUNCTION update_custom_items_updated_at();

-- Triggers for misc_expenses table
CREATE OR REPLACE FUNCTION update_misc_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_misc_expenses_updated_at
    BEFORE UPDATE ON misc_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_misc_expenses_updated_at();

-- Row Level Security (RLS) - Enable for production
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Sample data (optional)
INSERT INTO products (name, unit, sale_price, quantity, buying_date) VALUES
    ('Rice', 'kg', 3.00, 100.0, CURRENT_DATE),
    ('Chickpeas', 'kg', 3.75, 50.0, CURRENT_DATE),
    ('Lentils', 'kg', 3.25, 75.0, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Sample sales data (optional)
INSERT INTO sales (product_id, weight, price_per_kg, expected_cash, received_cash, sale_date, topup, charity, credit, arrears) VALUES
    ((SELECT id FROM products WHERE name = 'Rice' LIMIT 1), 10.0, 3.00, 30.00, 25.00, CURRENT_DATE, 0, 2.00, 1.00, 4.00),
    ((SELECT id FROM products WHERE name = 'Chickpeas' LIMIT 1), 5.0, 3.75, 18.75, 18.75, CURRENT_DATE, 0, 0.00, 0.00, 0.00)
ON CONFLICT DO NOTHING;

-- Sample custom items data
INSERT INTO custom_items (name, unit) VALUES
    ('Custom Spice Mix', 'pack'),
    ('Special Rice Blend', 'kg'),
    ('Organic Vegetables', 'pack'),
    ('Premium Oil', 'liter'),
    ('Fresh Herbs', 'gram')
ON CONFLICT (name) DO NOTHING;

-- Sample expense data (updated to use any name)
INSERT INTO expenses (name, unit, price, quantity, weight, expense_date, notes) VALUES
    ('Onions', 'kg', 2.50, 5.0, 5.0, '2024-01-15', 'Fresh onions for cooking'),
    ('Tomatto', 'kg', 3.00, 3.0, 3.0, '2024-01-15', 'Ripe tomatoes'),
    ('Hari Mirch', 'kg', 8.00, 0.5, 0.5, '2024-01-15', 'Green chilies'),
    ('Custom Spice Mix', 'pack', 15.00, 2.0, NULL, '2024-01-15', 'Special blend for curry'),
    ('Special Rice Blend', 'kg', 12.00, 10.0, 10.0, '2024-01-15', 'Premium rice variety')
ON CONFLICT DO NOTHING;

-- Sample misc expense data (optional)
INSERT INTO misc_expenses (name, price, quantity, expense_date, notes) VALUES
    ('Office Supplies', 15.50, 1, CURRENT_DATE, 'Printer paper and pens'),
    ('Travel Expenses', 45.00, 1, CURRENT_DATE, 'Fuel for charity visits'),
    ('Maintenance', 25.00, 1, CURRENT_DATE, 'Equipment repair costs')
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE products IS 'Stores product inventory information';
COMMENT ON TABLE sales IS 'Stores sales transactions';
COMMENT ON TABLE expenses IS 'General household/kitchen expenses with predefined and custom items';
COMMENT ON COLUMN sales.arrears IS 'Calculated field: expected_cash - (received_cash + topup + charity + credit)';
COMMENT ON COLUMN sales.charity IS 'Charity amount that gets added to arrears calculation';
COMMENT ON COLUMN sales.credit IS 'Credit amount that gets added to total received calculation';
COMMENT ON COLUMN expenses.weight IS 'Optional weight in kg for items that can be measured by weight';
COMMENT ON COLUMN expenses.notes IS 'Optional notes about the expense';

-- Comments for misc_expenses table
COMMENT ON TABLE misc_expenses IS 'Stores custom user-defined miscellaneous expenses';
COMMENT ON COLUMN misc_expenses.name IS 'User-defined expense name';
COMMENT ON COLUMN misc_expenses.notes IS 'Optional notes about the expense';

-- Comments for custom_items table
COMMENT ON TABLE custom_items IS 'User-defined custom items for General Expenses';
COMMENT ON COLUMN custom_items.name IS 'User-defined item name, must be unique';
COMMENT ON COLUMN custom_items.unit IS 'Unit of measurement for the custom item';
COMMENT ON COLUMN custom_items.created_at IS 'Timestamp when the custom item was created';
COMMENT ON COLUMN custom_items.updated_at IS 'Timestamp when the custom item was last updated';

-- Comments for expenses table
COMMENT ON TABLE expenses IS 'General household/kitchen expenses with predefined and custom items';
COMMENT ON COLUMN expenses.name IS 'Item name (can be predefined or custom)';
COMMENT ON COLUMN expenses.unit IS 'Unit of measurement';
COMMENT ON COLUMN expenses.price IS 'Price per unit';
COMMENT ON COLUMN expenses.quantity IS 'Quantity purchased';
COMMENT ON COLUMN expenses.weight IS 'Optional weight in kg';
COMMENT ON COLUMN expenses.expense_date IS 'Date when expense was incurred';
COMMENT ON COLUMN expenses.notes IS 'Optional notes about the expense';
COMMENT ON COLUMN expenses.created_at IS 'Timestamp when expense was recorded';
COMMENT ON COLUMN expenses.updated_at IS 'Timestamp when expense was last updated';
