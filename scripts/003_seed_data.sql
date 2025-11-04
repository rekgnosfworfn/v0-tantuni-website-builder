-- Insert default categories
INSERT INTO categories (name, slug, display_order) VALUES
  ('Tantuniler', 'tantuniler', 1),
  ('İçecekler', 'icecekler', 2)
ON CONFLICT (slug) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', '33 Mersin Tantuni'),
  ('site_logo', ''),
  ('site_favicon', ''),
  ('primary_color', '#DC2626'),
  ('secondary_color', '#F59E0B'),
  ('welcome_text', 'Mersin''in En Lezzetli Tantunisi')
ON CONFLICT (key) DO NOTHING;

-- Insert sample products for Tantuniler
INSERT INTO products (category_id, name, description, price, display_order, is_available)
SELECT 
  c.id,
  'Klasik Tantuni',
  'Geleneksel Mersin tantunisi',
  85.00,
  1,
  true
FROM categories c WHERE c.slug = 'tantuniler'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, display_order, is_available)
SELECT 
  c.id,
  'Acılı Tantuni',
  'Baharatlarla zenginleştirilmiş tantuni',
  90.00,
  2,
  true
FROM categories c WHERE c.slug = 'tantuniler'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, display_order, is_available)
SELECT 
  c.id,
  'Kaşarlı Tantuni',
  'Bol kaşar peynirli tantuni',
  95.00,
  3,
  true
FROM categories c WHERE c.slug = 'tantuniler'
ON CONFLICT DO NOTHING;

-- Insert sample products for İçecekler
INSERT INTO products (category_id, name, description, price, display_order, is_available)
SELECT 
  c.id,
  'Ayran',
  'Ev yapımı ayran',
  15.00,
  1,
  true
FROM categories c WHERE c.slug = 'icecekler'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, display_order, is_available)
SELECT 
  c.id,
  'Kola',
  'Soğuk kola',
  20.00,
  2,
  true
FROM categories c WHERE c.slug = 'icecekler'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, display_order, is_available)
SELECT 
  c.id,
  'Şalgam',
  'Acılı şalgam suyu',
  15.00,
  3,
  true
FROM categories c WHERE c.slug = 'icecekler'
ON CONFLICT DO NOTHING;
