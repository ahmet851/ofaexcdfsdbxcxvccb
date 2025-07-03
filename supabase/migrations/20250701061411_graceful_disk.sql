/*
  # Otel IT Zimmet Yönetim Sistemi - Veritabanı Şeması

  1. Yeni Tablolar
    - `devices` - Cihaz bilgileri ve özellikleri
    - `personnel` - Personel bilgileri ve iletişim detayları
    - `assignments` - Zimmet kayıtları ve geçmişi

  2. Güvenlik
    - Tüm tablolarda RLS etkinleştirildi
    - Genel erişim politikaları eklendi

  3. Özellikler
    - UUID primary key'ler
    - Otomatik timestamp'ler
    - JSONB veri tipleri
    - Foreign key ilişkileri
*/

-- Cihazlar tablosu
CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'retired')),
  assigned_to TEXT,
  assigned_date TIMESTAMPTZ,
  specifications JSONB DEFAULT '{}',
  maintenance_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personel tablosu
CREATE TABLE IF NOT EXISTS personnel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  title TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  assigned_devices TEXT[] DEFAULT '{}',
  assignment_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zimmetler tablosu
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE,
  assigned_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Güncelleme trigger'ları
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_serial ON devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_personnel_department ON personnel(department);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_device ON assignments(device_id);
CREATE INDEX IF NOT EXISTS idx_assignments_personnel ON assignments(personnel_id);

-- Row Level Security etkinleştir
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Genel erişim politikaları (geliştirme için)
CREATE POLICY "Enable all operations for devices" ON devices FOR ALL USING (true);
CREATE POLICY "Enable all operations for personnel" ON personnel FOR ALL USING (true);
CREATE POLICY "Enable all operations for assignments" ON assignments FOR ALL USING (true);

-- Örnek veri ekleme
INSERT INTO devices (brand, category, serial_number, status, specifications) VALUES
('Dell', 'Laptop', 'DL001234', 'available', '{"ram": "16GB", "processor": "Intel Core i7", "generation": "12. Nesil"}'),
('HP', 'Masaüstü', 'HP005678', 'available', '{"ram": "8GB", "processor": "Intel Core i5", "generation": "11. Nesil"}'),
('Apple', 'Laptop', 'AP009876', 'available', '{"ram": "16GB", "processor": "Apple M2", "generation": "M2"}'),
('Canon', 'Yazıcı', 'CN001122', 'available', '{"type": "Lazer", "color": "Renkli"}'),
('Samsung', 'Monitör', 'SM003344', 'available', '{"size": "27 inç", "resolution": "4K"}'
) ON CONFLICT (serial_number) DO NOTHING;

INSERT INTO personnel (name, department, title, email, phone) VALUES
('Ahmet Yılmaz', 'CRM', 'Müşteri İlişkileri Müdürü', 'ahmet.yilmaz@otel.com', '+90-555-0101'),
('Fatma Demir', 'Animasyon', 'Animasyon Koordinatörü', 'fatma.demir@otel.com', '+90-555-0102'),
('Mehmet Kaya', 'Ses/Görüntü', 'Teknik Sorumlu', 'mehmet.kaya@otel.com', '+90-555-0103'),
('Ayşe Şahin', 'Aydınlatma', 'Aydınlatma Teknisyeni', 'ayse.sahin@otel.com', '+90-555-0104')
ON CONFLICT (email) DO NOTHING;