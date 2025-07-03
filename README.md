# Otel IT Zimmet Yönetim Sistemi

Modern ve kullanıcı dostu bir otel IT zimmet yönetim sistemi. Supabase veritabanı entegrasyonu ile kalıcı veri depolama ve gerçek zamanlı senkronizasyon özelliklerine sahiptir.

## Özellikler

### 🏨 Ana Panel
- Toplam cihaz sayısı
- Zimmetli cihaz sayısı  
- Aktif zimmet sayısı
- Gerçek zamanlı durum görselleştirme
- Hızlı yedekleme butonları (Excel/JSON)

### 💻 Cihaz Yönetimi
- Kategori yönetimi
- Arama ve filtreleme
- Cihaz kayıt formu:
  - Marka
  - Kategori
  - Seri numarası (kamera tarama simülasyonu)
  - Durum takibi
  - Donanım özellikleri (RAM, İşlemci, Nesil)
- Durum takibi
- Bakım programı entegrasyonu

### 👥 Personel Zimmet Modülü
- Departman bazlı organizasyon
- Personel bilgileri:
  - Ad Soyad
  - Departman
  - Ünvan
  - İletişim bilgileri
  - Zimmet geçmişi

### 📊 Raporlar Modülü
- Excel dışa aktarma:
  - Birleşik cihaz ve zimmet raporları
  - Sadece cihaz raporları
  - Personel zimmet geçmişi
  - Departman bazlı dağılım
- JSON yedekleme
- Özel rapor oluşturma
- Tarih aralığı filtreleme

### 🔄 İçe/Dışa Aktarma
- Excel veri içe aktarma
- Toplu cihaz kaydı
- Veri yedekleme/geri yükleme

### 🌐 Supabase Entegrasyonu
- Kalıcı veri depolama
- Gerçek zamanlı senkronizasyon
- Otomatik yedekleme
- Bulut tabanlı veritabanı

## Kurulum

### Gereksinimler
- Node.js 18+
- Supabase hesabı

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd hotel-asset-management
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Supabase kurulumu:**
   - [Supabase](https://supabase.com) hesabı oluşturun
   - Yeni proje oluşturun
   - Proje URL'si ve Anon Key'i alın

4. **Çevre değişkenlerini ayarlayın:**
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Veritabanı tablolarını oluşturun:**

Supabase SQL Editor'da aşağıdaki tabloları oluşturun:

```sql
-- Cihazlar tablosu
CREATE TABLE devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  assigned_to TEXT,
  assigned_date TIMESTAMPTZ,
  specifications JSONB DEFAULT '{}',
  maintenance_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personel tablosu
CREATE TABLE personnel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  title TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  assigned_devices TEXT[] DEFAULT '{}',
  assignment_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zimmetler tablosu
CREATE TABLE assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE,
  assigned_date TIMESTAMPTZ NOT NULL,
  returned_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security etkinleştir
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Genel erişim politikaları (geliştirme için)
CREATE POLICY "Enable all operations for devices" ON devices FOR ALL USING (true);
CREATE POLICY "Enable all operations for personnel" ON personnel FOR ALL USING (true);
CREATE POLICY "Enable all operations for assignments" ON assignments FOR ALL USING (true);
```

6. **Uygulamayı başlatın:**
```bash
npm run dev
```

## Kullanım

### Cihaz Ekleme
1. "Cihaz Yönetimi" sekmesine gidin
2. "Cihaz Ekle" butonuna tıklayın
3. Formu doldurun ve kaydedin

### Personel Ekleme
1. "Personel" sekmesine gidin
2. "Personel Ekle" butonuna tıklayın
3. Bilgileri girin ve kaydedin

### Zimmet Atama
1. Personel listesinde "Zimmet Yönetimi" butonuna tıklayın
2. Müsait cihazlardan birini seçin
3. Notlar ekleyip zimmetleyin

### Rapor Alma
1. "Raporlar" sekmesine gidin
2. Rapor türünü seçin
3. "Excel'e Aktar" veya "JSON Yedek" butonuna tıklayın

## Teknolojiler

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Veritabanı:** Supabase (PostgreSQL)
- **İkonlar:** Lucide React
- **Tarih İşleme:** date-fns
- **Excel Export:** xlsx
- **Build Tool:** Vite

## Özellikler

### Türkçe Dil Desteği
- Tüm arayüz Türkçe
- Tarih formatı: GG.AA.YYYY
- Türkiye yerel ayarları

### Gerçek Zamanlı Senkronizasyon
- Supabase Realtime ile anlık güncellemeler
- Çoklu kullanıcı desteği
- Otomatik veri yenileme

### Responsive Tasarım
- Mobil uyumlu
- Koyu/Açık tema desteği
- Modern ve kullanıcı dostu arayüz

### Veri Güvenliği
- Supabase Row Level Security
- Otomatik yedekleme
- Veri doğrulama

## Lisans

MIT License