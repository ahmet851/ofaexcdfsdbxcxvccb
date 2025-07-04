import * as XLSX from 'xlsx';
import { Device, Personnel, Assignment } from '../contexts/AppContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Türkçe tarih formatı
const formatTurkishDate = (date: Date) => {
  return format(date, 'dd.MM.yyyy', { locale: tr });
};

// Helper function for status text
const getStatusText = (status: string) => {
  switch (status) {
    case 'available': return 'Müsait';
    case 'assigned': return 'Zimmetli';
    case 'maintenance': return 'Bakımda';
    case 'retired': return 'Emekli';
    default: return status;
  }
};

// Helper function for storage info
const getStorageInfo = (device: Device) => {
  const { storageType, storageCapacity } = device.specifications;
  if (storageType && storageCapacity) {
    return `${storageType} ${storageCapacity}`;
  }
  if (storageType) return storageType;
  if (storageCapacity) return storageCapacity;
  return 'Belirtilmemiş';
};

// Excel export functions
export const exportToExcel = {
  devices: (devices: Device[], personnel: Personnel[]) => {
    const data = devices.map(device => {
      const person = personnel.find(p => p.name === device.assignedTo);

      return {
        'Cihaz ID': device.id,
        'Marka': device.brand,
        'Kategori': device.category,
        'Seri Numarası': device.serialNumber,
        'Durum': getStatusText(device.status),
        'Zimmetli Kişi': device.assignedTo || 'Yok',
        'Departman': person?.department || 'Yok',
        'Ünvan': person?.title || 'Yok',
        'RAM': device.specifications.ram || 'Belirtilmemiş',
        'İşlemci': device.specifications.processor || 'Belirtilmemiş',
        'Nesil': device.specifications.generation || 'Belirtilmemiş',
        'Depolama': getStorageInfo(device),
        'Oluşturma Tarihi': formatTurkishDate(device.createdAt),
        'Zimmet Tarihi': device.assignedDate ? formatTurkishDate(device.assignedDate) : 'Yok'
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cihazlar');

    const fileName = `cihazlar_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  personnel: (personnel: Personnel[]) => {
    const data = personnel.map(person => ({
      'Personel ID': person.id,
      'Ad Soyad': person.name,
      'Departman': person.department,
      'Ünvan': person.title,
      'E-posta': person.email,
      'Telefon': person.phone,
      'Zimmetli Cihaz Sayısı': person.assignedDevices.length
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Personel');

    const fileName = `personel_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  assignments: (assignments: Assignment[], devices: Device[], personnel: Personnel[]) => {
    const data = assignments.map(assignment => {
      const device = devices.find(d => d.id === assignment.deviceId);
      const person = personnel.find(p => p.id === assignment.personnelId);
      return {
        'Zimmet ID': assignment.id,
        'Cihaz': device ? `${device.brand} ${device.category}` : 'Bilinmiyor',
        'Seri Numarası': device?.serialNumber || 'Bilinmiyor',
        'Depolama': device ? getStorageInfo(device) : 'Bilinmiyor',
        'Personel': person?.name || 'Bilinmiyor',
        'Departman': person?.department || 'Bilinmiyor',
        'Zimmet Tarihi': formatTurkishDate(assignment.assignedDate),
        'İade Tarihi': assignment.returnedDate ? formatTurkishDate(assignment.returnedDate) : 'Aktif',
        'Durum': assignment.status === 'active' ? 'Aktif' : 'İade Edildi',
        'Notlar': assignment.notes || 'Yok'
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Zimmetler');

    const fileName = `zimmetler_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  },

  combined: (devices: Device[], personnel: Personnel[], assignments: Assignment[]) => {
    const wb = XLSX.utils.book_new();

    // Cihazlar sayfası
    const deviceData = devices.map(device => {
      const person = personnel.find(p => p.name === device.assignedTo);

      return {
        'Cihaz ID': device.id,
        'Marka': device.brand,
        'Kategori': device.category,
        'Seri Numarası': device.serialNumber,
        'Durum': getStatusText(device.status),
        'Zimmetli Kişi': device.assignedTo || 'Yok',
        'Departman': person?.department || 'Yok',
        'Ünvan': person?.title || 'Yok',
        'RAM': device.specifications.ram || 'Belirtilmemiş',
        'İşlemci': device.specifications.processor || 'Belirtilmemiş',
        'Nesil': device.specifications.generation || 'Belirtilmemiş',
        'Depolama': getStorageInfo(device),
        'Oluşturma Tarihi': formatTurkishDate(device.createdAt)
      };
    });
    const deviceWs = XLSX.utils.json_to_sheet(deviceData);
    XLSX.utils.book_append_sheet(wb, deviceWs, 'Cihazlar');

    // Personel sayfası
    const personnelData = personnel.map(person => ({
      'Personel ID': person.id,
      'Ad Soyad': person.name,
      'Departman': person.department,
      'Ünvan': person.title,
      'E-posta': person.email,
      'Telefon': person.phone,
      'Zimmetli Cihaz Sayısı': person.assignedDevices.length
    }));
    const personnelWs = XLSX.utils.json_to_sheet(personnelData);
    XLSX.utils.book_append_sheet(wb, personnelWs, 'Personel');

    // Zimmetler sayfası
    const assignmentData = assignments.map(assignment => {
      const device = devices.find(d => d.id === assignment.deviceId);
      const person = personnel.find(p => p.id === assignment.personnelId);
      return {
        'Zimmet ID': assignment.id,
        'Cihaz': device ? `${device.brand} ${device.category}` : 'Bilinmiyor',
        'Seri Numarası': device?.serialNumber || 'Bilinmiyor',
        'Depolama': device ? getStorageInfo(device) : 'Bilinmiyor',
        'Personel': person?.name || 'Bilinmiyor',
        'Departman': person?.department || 'Bilinmiyor',
        'Zimmet Tarihi': formatTurkishDate(assignment.assignedDate),
        'İade Tarihi': assignment.returnedDate ? formatTurkishDate(assignment.returnedDate) : 'Aktif',
        'Durum': assignment.status === 'active' ? 'Aktif' : 'İade Edildi',
        'Notlar': assignment.notes || 'Yok'
      };
    });
    const assignmentWs = XLSX.utils.json_to_sheet(assignmentData);
    XLSX.utils.book_append_sheet(wb, assignmentWs, 'Zimmetler');

    const fileName = `zimmet_raporu_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
};

// JSON export functions
export const exportToJSON = {
  all: (devices: Device[], personnel: Personnel[], assignments: Assignment[]) => {
    const data = {
      exportDate: formatTurkishDate(new Date()),
      devices: devices.map(device => ({
        ...device,
        createdAt: formatTurkishDate(device.createdAt),
        assignedDate: device.assignedDate ? formatTurkishDate(device.assignedDate) : null,
        maintenanceDate: device.maintenanceDate ? formatTurkishDate(device.maintenanceDate) : null
      })),
      personnel,
      assignments: assignments.map(assignment => ({
        ...assignment,
        assignedDate: formatTurkishDate(assignment.assignedDate),
        returnedDate: assignment.returnedDate ? formatTurkishDate(assignment.returnedDate) : null
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zimmet_yedegi_${format(new Date(), 'dd-MM-yyyy')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};