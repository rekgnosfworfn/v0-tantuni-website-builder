-- Add customization options to products
-- This allows products to have customizable options (e.g., add/remove ingredients)

-- Create product_customizations table
CREATE TABLE IF NOT EXISTS product_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Malzeme Seçimi", "Acılık Tercihi"
  type TEXT NOT NULL CHECK (type IN ('checkbox', 'radio', 'select')),
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customization_options table
CREATE TABLE IF NOT EXISTS customization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customization_id UUID NOT NULL REFERENCES product_customizations(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- e.g., "Soğan ekle", "Acılı", "İnce lavaş"
  price_adjustment DECIMAL(10, 2) DEFAULT 0, -- Extra price (can be negative for removals)
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add customization field to order_items for storing selected customizations
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS customizations JSONB;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_customizations_product_id ON product_customizations(product_id);
CREATE INDEX IF NOT EXISTS idx_customization_options_customization_id ON customization_options(customization_id);

-- Example data for Tantuni product
-- This will be managed through admin panel, but here's an example:
/*
INSERT INTO product_customizations (product_id, name, type, is_required, display_order)
VALUES
  ((SELECT id FROM products WHERE name LIKE '%Tantuni%' LIMIT 1), 'Malzeme Tercihleri', 'checkbox', false, 1),
  ((SELECT id FROM products WHERE name LIKE '%Tantuni%' LIMIT 1), 'Acılık Seviyesi', 'radio', true, 2),
  ((SELECT id FROM products WHERE name LIKE '%Tantuni%' LIMIT 1), 'Lavaş Tipi', 'radio', true, 3);

INSERT INTO customization_options (customization_id, label, price_adjustment, display_order)
VALUES
  ((SELECT id FROM product_customizations WHERE name = 'Malzeme Tercihleri'), 'Soğan ekle', 0, 1),
  ((SELECT id FROM product_customizations WHERE name = 'Malzeme Tercihleri'), 'Soğan çıkar', 0, 2),
  ((SELECT id FROM product_customizations WHERE name = 'Malzeme Tercihleri'), 'Ekstra peynir', 5.00, 3),
  ((SELECT id FROM product_customizations WHERE name = 'Acılık Seviyesi'), 'Acısız', 0, 1),
  ((SELECT id FROM product_customizations WHERE name = 'Acılık Seviyesi'), 'Az acı', 0, 2),
  ((SELECT id FROM product_customizations WHERE name = 'Acılık Seviyesi'), 'Çok acı', 0, 3),
  ((SELECT id FROM product_customizations WHERE name = 'Lavaş Tipi'), 'İnce lavaş', 0, 1),
  ((SELECT id FROM product_customizations WHERE name = 'Lavaş Tipi'), 'Kalın lavaş', 0, 2);
*/
