/*
  # Inventory Management System - Database Schema

  1. New Tables
    - `inventory_items` - Main inventory tracking with comprehensive fields
    - `inventory_maintenance` - Maintenance and repair history
    - `inventory_audit` - Audit trail for all inventory changes

  2. Security
    - Enable RLS on all new tables
    - Add policies for general access

  3. Features
    - Complete inventory tracking
    - Maintenance history
    - Audit trail
    - Status management
    - Warranty tracking
*/

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  purchase_date DATE,
  current_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (current_status IN ('in_stock', 'defective', 'under_repair', 'disposed')),
  location_department TEXT NOT NULL,
  warranty_start_date DATE,
  warranty_end_date DATE,
  warranty_provider TEXT,
  purchase_price DECIMAL(10,2),
  supplier TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  specifications JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance history table
CREATE TABLE IF NOT EXISTS inventory_maintenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('repair', 'preventive', 'inspection', 'replacement')),
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  completion_date DATE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  cost DECIMAL(10,2),
  technician TEXT,
  supplier_service TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trail table
CREATE TABLE IF NOT EXISTS inventory_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by TEXT NOT NULL,
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update triggers for inventory tables
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_maintenance_updated_at BEFORE UPDATE ON inventory_maintenance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(current_status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_serial ON inventory_items(serial_number);
CREATE INDEX IF NOT EXISTS idx_inventory_items_department ON inventory_items(location_department);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_maintenance_item ON inventory_maintenance(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_maintenance_status ON inventory_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_inventory_audit_item ON inventory_audit(inventory_item_id);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_audit ENABLE ROW LEVEL SECURITY;

-- General access policies
CREATE POLICY "Enable all operations for inventory_items" ON inventory_items FOR ALL USING (true);
CREATE POLICY "Enable all operations for inventory_maintenance" ON inventory_maintenance FOR ALL USING (true);
CREATE POLICY "Enable all operations for inventory_audit" ON inventory_audit FOR ALL USING (true);

-- Sample data
INSERT INTO inventory_items (item_name, serial_number, purchase_date, current_status, location_department, warranty_start_date, warranty_end_date, warranty_provider, category, brand, model, specifications) VALUES
('Dell OptiPlex 7090', 'INV001234', '2023-01-15', 'in_stock', 'CRM', '2023-01-15', '2026-01-15', 'Dell Warranty', 'Masaüstü', 'Dell', 'OptiPlex 7090', '{"ram": "16GB", "processor": "Intel Core i7", "storage": "SSD 512GB"}'),
('HP LaserJet Pro', 'INV002345', '2023-02-20', 'in_stock', 'Ön Büro', '2023-02-20', '2025-02-20', 'HP Care Pack', 'Yazıcı', 'HP', 'LaserJet Pro M404n', '{"type": "Lazer", "color": "Monokrom"}'),
('Samsung Monitor', 'INV003456', '2023-03-10', 'defective', 'Animasyon', '2023-03-10', '2025-03-10', 'Samsung Warranty', 'Monitör', 'Samsung', 'U28E590D', '{"size": "28 inch", "resolution": "4K"}'),
('Canon Camera', 'INV004567', '2023-04-05', 'under_repair', 'Ses/Görüntü', '2023-04-05', '2025-04-05', 'Canon Professional', 'Kamera', 'Canon', 'EOS R6', '{"type": "Mirrorless", "resolution": "20MP"}')
ON CONFLICT (serial_number) DO NOTHING;

INSERT INTO inventory_maintenance (inventory_item_id, maintenance_type, description, start_date, status, technician) VALUES
((SELECT id FROM inventory_items WHERE serial_number = 'INV003456'), 'repair', 'Ekran arızası - piksel hatası', '2024-01-15', 'in_progress', 'Teknik Servis A'),
((SELECT id FROM inventory_items WHERE serial_number = 'INV004567'), 'repair', 'Lens motor arızası', '2024-01-20', 'in_progress', 'Canon Yetkili Servis')
ON CONFLICT DO NOTHING;