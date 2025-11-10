-- Create tables management system for QR code ordering

-- Create tables table
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL UNIQUE,
  table_name TEXT, -- e.g., "Masa 1", "A1", "Balkon 3"
  qr_code TEXT UNIQUE, -- Unique QR code identifier
  is_active BOOLEAN DEFAULT true,
  capacity INTEGER DEFAULT 4,
  location TEXT, -- e.g., "İç Mekan", "Bahçe", "Balkon"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add table_id to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES tables(id) ON DELETE SET NULL;

-- Add table_number for quick reference (denormalized for performance)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS table_number INTEGER;

-- Create waiter_calls table for "Garson Çağır" feature
CREATE TABLE IF NOT EXISTS waiter_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'completed')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tables_is_active ON tables(is_active);
CREATE INDEX IF NOT EXISTS idx_tables_qr_code ON tables(qr_code);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_status ON waiter_calls(status);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_table_id ON waiter_calls(table_id);

-- Insert sample tables
INSERT INTO tables (table_number, table_name, qr_code, location, capacity)
VALUES
  (1, 'Masa 1', 'QR_TABLE_001', 'İç Mekan', 4),
  (2, 'Masa 2', 'QR_TABLE_002', 'İç Mekan', 4),
  (3, 'Masa 3', 'QR_TABLE_003', 'İç Mekan', 6),
  (4, 'Masa 4', 'QR_TABLE_004', 'Bahçe', 4),
  (5, 'Masa 5', 'QR_TABLE_005', 'Bahçe', 8)
ON CONFLICT (table_number) DO NOTHING;
