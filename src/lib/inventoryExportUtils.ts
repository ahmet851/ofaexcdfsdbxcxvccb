import * as XLSX from 'xlsx';
import { InventoryItem, MaintenanceRecord } from '../contexts/InventoryContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Türkçe tarih formatı
const formatTurkishDate = (date: Date) => {
  return format(date, 'dd.MM.yyyy', { locale: tr });
};

// Helper function for status text
const getStatusText = (status: string) => {
  switch (status) {
    case 'in_stock': return 'Stokta';
    case 'defective': return 'Arızalı';
    case 'under_repair': return 'Onarımda';
    case 'disposed': return 'İmha Edildi';
    default: return status;
  }
};

const getMaintenanceTypeText = (type: string) => {
  switch (type) {
    case 'repair': return 'Onarım';
    case 'preventive': return 'Önleyici Bakım';
    case 'inspection': return 'İnceleme';
    case 'replacement': return 'Değiştirme';
    default: return type;
  }
};

const getMaintenanceStatusText = (status: string) => {
  switch (status) {
    case 'scheduled': return 'Planlandı';
    case 'in_progress': return 'Devam Ediyor';
    case 'completed': return 'Tamamlandı';
    case 'cancelled': return 'İptal Edildi';
    default: return status;
  }
};

// Excel export functions
export const exportInventoryToExcel = {
  items: (items: InventoryItem[]) => {
    const data = items.map(item => ({
      'Envanter ID': item.id,
      'Öğe Adı': item.itemName,
      'Seri Numarası': item.serialNumber,
      'Kategori': item.category,
      'Marka': item.brand || 'Belirtilmemiş',
      'Model': item.model || 'Belirtilmemiş',
      'Durum': getStatusText(item.currentStatus),
      'Lokasyon/Departman': item.locationDepartment,
      'Satın Alma Tarihi': item.purchaseDate ? formatTurkishDate(item.purchaseDate) : 'Belirtilmemiş',
      'Satın Alma Fiyatı': item.purchasePrice ? `₺${item.purchasePrice.toLocaleString('tr-TR')}` : 'Belirtilmemiş',
      'Tedarikçi': item.supplier || 'Belirtilmemiş',
      'Garanti Başlangıç': item.warrantyStartDate ? formatTurkishDate(item.warrantyStartDate) : 'Belirtilmemiş',
      'Garanti Bitiş': item.warrantyEndDate ? formatTurkishDate(item.warrantyEndDate) : 'Belirtilmemiş',
      'Garanti Sağlayıcı': item.warrantyProvider || 'Belirtilmemiş',
      'Notlar': item.notes || 'Yok',
      'Oluşturma Tarihi': formatTurkishDate(item.createdAt)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Envanter');

    const fileName = `envanter_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  maintenance: (maintenanceRecords: MaintenanceRecord[], items: InventoryItem[]) => {
    const data = maintenanceRecords.map(record => {
      const item = items.find(i => i.id === record.inventoryItemId);
      return {
        'Bakım ID': record.id,
        'Öğe Adı': item?.itemName || 'Bilinmiyor',
        'Seri Numarası': item?.serialNumber || 'Bilinmiyor',
        'Bakım Türü': getMaintenanceTypeText(record.maintenanceType),
        'Açıklama': record.description,
        'Başlangıç Tarihi': formatTurkishDate(record.startDate),
        'Bitiş Tarihi': record.completionDate ? formatTurkishDate(record.completionDate) : 'Devam Ediyor',
        'Durum': getMaintenanceStatusText(record.status),
        'Maliyet': record.cost ? `₺${record.cost.toLocaleString('tr-TR')}` : 'Belirtilmemiş',
        'Teknisyen': record.technician || 'Belirtilmemiş',
        'Servis Sağlayıcı': record.supplierService || 'Belirtilmemiş',
        'Notlar': record.notes || 'Yok'
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bakım Kayıtları');

    const fileName = `bakim_kayitlari_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  all: (items: InventoryItem[], maintenanceRecords: MaintenanceRecord[]) => {
    const wb = XLSX.utils.book_new();

    // Envanter sayfası
    const inventoryData = items.map(item => ({
      'Envanter ID': item.id,
      'Öğe Adı': item.itemName,
      'Seri Numarası': item.serialNumber,
      'Kategori': item.category,
      'Marka': item.brand || 'Belirtilmemiş',
      'Model': item.model || 'Belirtilmemiş',
      'Durum': getStatusText(item.currentStatus),
      'Lokasyon/Departman': item.locationDepartment,
      'Satın Alma Tarihi': item.purchaseDate ? formatTurkishDate(item.purchaseDate) : 'Belirtilmemiş',
      'Satın Alma Fiyatı': item.purchasePrice ? `₺${item.purchasePrice.toLocaleString('tr-TR')}` : 'Belirtilmemiş',
      'Tedarikçi': item.supplier || 'Belirtilmemiş',
      'Garanti Başlangıç': item.warrantyStartDate ? formatTurkishDate(item.warrantyStartDate) : 'Belirtilmemiş',
      'Garanti Bitiş': item.warrantyEndDate ? formatTurkishDate(item.warrantyEndDate) : 'Belirtilmemiş',
      'Garanti Sağlayıcı': item.warrantyProvider || 'Belirtilmemiş',
      'Notlar': item.notes || 'Yok',
      'Oluşturma Tarihi': formatTurkishDate(item.createdAt)
    }));
    const inventoryWs = XLSX.utils.json_to_sheet(inventoryData);
    XLSX.utils.book_append_sheet(wb, inventoryWs, 'Envanter');

    // Bakım kayıtları sayfası
    const maintenanceData = maintenanceRecords.map(record => {
      const item = items.find(i => i.id === record.inventoryItemId);
      return {
        'Bakım ID': record.id,
        'Öğe Adı': item?.itemName || 'Bilinmiyor',
        'Seri Numarası': item?.serialNumber || 'Bilinmiyor',
        'Bakım Türü': getMaintenanceTypeText(record.maintenanceType),
        'Açıklama': record.description,
        'Başlangıç Tarihi': formatTurkishDate(record.startDate),
        'Bitiş Tarihi': record.completionDate ? formatTurkishDate(record.completionDate) : 'Devam Ediyor',
        'Durum': getMaintenanceStatusText(record.status),
        'Maliyet': record.cost ? `₺${record.cost.toLocaleString('tr-TR')}` : 'Belirtilmemiş',
        'Teknisyen': record.technician || 'Belirtilmemiş',
        'Servis Sağlayıcı': record.supplierService || 'Belirtilmemiş',
        'Notlar': record.notes || 'Yok'
      };
    });
    const maintenanceWs = XLSX.utils.json_to_sheet(maintenanceData);
    XLSX.utils.book_append_sheet(wb, maintenanceWs, 'Bakım Kayıtları');

    // Özet sayfası
    const summaryData = [
      { 'Kategori': 'Toplam Envanter', 'Sayı': items.length },
      { 'Kategori': 'Stokta', 'Sayı': items.filter(i => i.currentStatus === 'in_stock').length },
      { 'Kategori': 'Arızalı', 'Sayı': items.filter(i => i.currentStatus === 'defective').length },
      { 'Kategori': 'Onarımda', 'Sayı': items.filter(i => i.currentStatus === 'under_repair').length },
      { 'Kategori': 'İmha Edildi', 'Sayı': items.filter(i => i.currentStatus === 'disposed').length },
      { 'Kategori': 'Toplam Bakım Kaydı', 'Sayı': maintenanceRecords.length },
      { 'Kategori': 'Aktif Bakım', 'Sayı': maintenanceRecords.filter(r => r.status === 'in_progress').length }
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Özet');

    const fileName = `envanter_raporu_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
};

// JSON export functions
export const exportInventoryToJSON = {
  all: (items: InventoryItem[], maintenanceRecords: MaintenanceRecord[]) => {
    const data = {
      exportDate: formatTurkishDate(new Date()),
      inventory: items.map(item => ({
        ...item,
        createdAt: formatTurkishDate(item.createdAt),
        updatedAt: formatTurkishDate(item.updatedAt),
        purchaseDate: item.purchaseDate ? formatTurkishDate(item.purchaseDate) : null,
        warrantyStartDate: item.warrantyStartDate ? formatTurkishDate(item.warrantyStartDate) : null,
        warrantyEndDate: item.warrantyEndDate ? formatTurkishDate(item.warrantyEndDate) : null
      })),
      maintenance: maintenanceRecords.map(record => ({
        ...record,
        startDate: formatTurkishDate(record.startDate),
        completionDate: record.completionDate ? formatTurkishDate(record.completionDate) : null,
        createdAt: formatTurkishDate(record.createdAt)
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `envanter_yedegi_${format(new Date(), 'dd-MM-yyyy')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};