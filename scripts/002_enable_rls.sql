-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for categories (everyone can view)
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT
  USING (true);

-- Public read access for available products (everyone can view)
CREATE POLICY "Allow public read access to products"
  ON products FOR SELECT
  USING (is_available = true);

-- Public insert access for orders (customers can create orders)
CREATE POLICY "Allow public insert access to orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Public insert access for order_items (customers can add items)
CREATE POLICY "Allow public insert access to order_items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Public read access to site_settings (everyone can view theme)
CREATE POLICY "Allow public read access to site_settings"
  ON site_settings FOR SELECT
  USING (true);

-- Admin policies for categories
CREATE POLICY "Allow admin full access to categories"
  ON categories FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Admin policies for products
CREATE POLICY "Allow admin full access to products"
  ON products FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Admin policies for orders (read, update, delete)
CREATE POLICY "Allow admin read access to orders"
  ON orders FOR SELECT
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Allow admin update access to orders"
  ON orders FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Allow admin delete access to orders"
  ON orders FOR DELETE
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Admin policies for order_items
CREATE POLICY "Allow admin read access to order_items"
  ON order_items FOR SELECT
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Admin policies for site_settings
CREATE POLICY "Allow admin full access to site_settings"
  ON site_settings FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Admin users policies
CREATE POLICY "Allow admin read own profile"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow admin update own profile"
  ON admin_users FOR UPDATE
  USING (auth.uid() = id);
