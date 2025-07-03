import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { deviceService, personnelService, assignmentService } from '../lib/database';
import { supabase } from '../lib/supabase';

export interface Device {
  id: string;
  brand: string;
  category: string;
  serialNumber: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  assignedTo?: string;
  assignedDate?: Date;
  specifications: {
    ram?: string;
    processor?: string;
    generation?: string;
  };
  maintenanceDate?: Date;
  createdAt: Date;
}

export interface Personnel {
  id: string;
  name: string;
  department: string;
  title: string;
  email: string;
  phone: string;
  assignedDevices: string[];
  assignmentHistory: Assignment[];
}

export interface Assignment {
  id: string;
  deviceId: string;
  personnelId: string;
  assignedDate: Date;
  returnedDate?: Date;
  status: 'active' | 'returned';
  notes?: string;
}

interface AppContextType {
  devices: Device[];
  personnel: Personnel[];
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  addDevice: (device: Omit<Device, 'id' | 'createdAt'>) => Promise<void>;
  updateDevice: (id: string, updates: Partial<Device>) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  addPersonnel: (person: Omit<Personnel, 'id' | 'assignedDevices' | 'assignmentHistory'>) => Promise<void>;
  updatePersonnel: (id: string, updates: Partial<Personnel>) => Promise<void>;
  deletePersonnel: (id: string) => Promise<void>;
  assignDevice: (deviceId: string, personnelId: string, notes?: string) => Promise<void>;
  returnDevice: (assignmentId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  categories: string[];
  departments: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultCategories = ['Laptop', 'Masaüstü', 'Monitör', 'Yazıcı', 'Telefon', 'Tablet', 'Kamera', 'Ses Ekipmanı', 'Ağ Ekipmanı', 'Diğer'];
const defaultDepartments = ['CRM', 'Animasyon', 'I.T', 'Ses/Görüntü', 'Misafir ilişkileri', 'Mutfak', 'Ön Büro', 'Temizlik', 'Bakım', 'Güvenlik', 'Yönetim', 'SPA', 'TEKNİK SERVİS', 'SATIN ALMA', 'H.K', 'İK', 'F&B'];


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [devicesData, personnelData, assignmentsData] = await Promise.all([
        deviceService.getAll(),
        personnelService.getAll(),
        assignmentService.getAll()
      ]);

      setDevices(devicesData);
      setPersonnel(personnelData);
      setAssignments(assignmentsData);
      
      console.log('Veriler başarıyla yüklendi:', {
        devices: devicesData.length,
        personnel: personnelData.length,
        assignments: assignmentsData.length
      });
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    loadData();

    // Subscribe to real-time changes
    const devicesSubscription = supabase
      .channel('devices_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'devices' 
      }, (payload) => {
        console.log('Cihaz değişikliği:', payload);
        refreshData();
      })
      .subscribe();

    const personnelSubscription = supabase
      .channel('personnel_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'personnel' 
      }, (payload) => {
        console.log('Personel değişikliği:', payload);
        refreshData();
      })
      .subscribe();

    const assignmentsSubscription = supabase
      .channel('assignments_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'assignments' 
      }, (payload) => {
        console.log('Zimmet değişikliği:', payload);
        refreshData();
      })
      .subscribe();

    return () => {
      devicesSubscription.unsubscribe();
      personnelSubscription.unsubscribe();
      assignmentsSubscription.unsubscribe();
    };
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  const addDevice = async (deviceData: Omit<Device, 'id' | 'createdAt'>) => {
    try {
      const newDevice = await deviceService.create(deviceData);
      setDevices(prev => [newDevice, ...prev]);
      console.log('Cihaz başarıyla eklendi:', newDevice);
    } catch (err) {
      console.error('Cihaz ekleme hatası:', err);
      setError('Cihaz eklenirken bir hata oluştu');
      throw err;
    }
  };

  const updateDevice = async (id: string, updates: Partial<Device>) => {
    try {
      const updatedDevice = await deviceService.update(id, updates);
      setDevices(prev => prev.map(device => 
        device.id === id ? updatedDevice : device
      ));
      console.log('Cihaz başarıyla güncellendi:', updatedDevice);
    } catch (err) {
      console.error('Cihaz güncelleme hatası:', err);
      setError('Cihaz güncellenirken bir hata oluştu');
      throw err;
    }
  };

  const deleteDevice = async (id: string) => {
    if (!confirm('Bu cihazı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await deviceService.delete(id);
      setDevices(prev => prev.filter(device => device.id !== id));
      console.log('Cihaz başarıyla silindi:', id);
    } catch (err) {
      console.error('Cihaz silme hatası:', err);
      setError('Cihaz silinirken bir hata oluştu');
      throw err;
    }
  };

  const addPersonnel = async (personData: Omit<Personnel, 'id' | 'assignedDevices' | 'assignmentHistory'>) => {
    try {
      const newPerson = await personnelService.create(personData);
      setPersonnel(prev => [newPerson, ...prev]);
      console.log('Personel başarıyla eklendi:', newPerson);
    } catch (err) {
      console.error('Personel ekleme hatası:', err);
      setError('Personel eklenirken bir hata oluştu');
      throw err;
    }
  };

  const updatePersonnel = async (id: string, updates: Partial<Personnel>) => {
    try {
      const updatedPerson = await personnelService.update(id, updates);
      setPersonnel(prev => prev.map(person => 
        person.id === id ? updatedPerson : person
      ));
      console.log('Personel başarıyla güncellendi:', updatedPerson);
    } catch (err) {
      console.error('Personel güncelleme hatası:', err);
      setError('Personel güncellenirken bir hata oluştu');
      throw err;
    }
  };

  const deletePersonnel = async (id: string) => {
    if (!confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await personnelService.delete(id);
      setPersonnel(prev => prev.filter(person => person.id !== id));
      console.log('Personel başarıyla silindi:', id);
    } catch (err) {
      console.error('Personel silme hatası:', err);
      setError('Personel silinirken bir hata oluştu');
      throw err;
    }
  };

  const assignDevice = async (deviceId: string, personnelId: string, notes?: string) => {
    try {
      const device = devices.find(d => d.id === deviceId);
      const person = personnel.find(p => p.id === personnelId);
      
      if (!device || !person) {
        throw new Error('Cihaz veya personel bulunamadı');
      }

      if (device.status !== 'available') {
        throw new Error('Bu cihaz zimmetlenebilir durumda değil');
      }

      // Create assignment record
      const assignment: Omit<Assignment, 'id'> = {
        deviceId,
        personnelId,
        assignedDate: new Date(),
        status: 'active',
        notes
      };

      const newAssignment = await assignmentService.create(assignment);
      setAssignments(prev => [newAssignment, ...prev]);
      
      // Update device status
      await updateDevice(deviceId, { 
        status: 'assigned',
        assignedTo: person.name,
        assignedDate: new Date()
      });

      // Update personnel assigned devices
      await updatePersonnel(personnelId, {
        assignedDevices: [...person.assignedDevices, deviceId]
      });

      console.log('Zimmet başarıyla atandı:', newAssignment);
    } catch (err) {
      console.error('Zimmet atama hatası:', err);
      setError('Zimmet atanırken bir hata oluştu');
      throw err;
    }
  };

  const returnDevice = async (assignmentId: string) => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        throw new Error('Zimmet kaydı bulunamadı');
      }

      const device = devices.find(d => d.id === assignment.deviceId);
      const person = personnel.find(p => p.id === assignment.personnelId);

      if (!device || !person) {
        throw new Error('Cihaz veya personel bulunamadı');
      }

      // Update assignment status
      await assignmentService.update(assignmentId, { 
        status: 'returned', 
        returnedDate: new Date() 
      });

      setAssignments(prev => prev.map(a => 
        a.id === assignmentId 
          ? { ...a, status: 'returned', returnedDate: new Date() }
          : a
      ));

      // Update device status
      await updateDevice(assignment.deviceId, { 
        status: 'available',
        assignedTo: undefined,
        assignedDate: undefined
      });

      // Update personnel assigned devices
      await updatePersonnel(assignment.personnelId, {
        assignedDevices: person.assignedDevices.filter(id => id !== assignment.deviceId)
      });

      console.log('Zimmet başarıyla iade edildi:', assignmentId);
    } catch (err) {
      console.error('Zimmet iade hatası:', err);
      setError('Zimmet iade edilirken bir hata oluştu');
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      devices,
      personnel,
      assignments,
      loading,
      error,
      addDevice,
      updateDevice,
      deleteDevice,
      addPersonnel,
      updatePersonnel,
      deletePersonnel,
      assignDevice,
      returnDevice,
      refreshData,
      categories: defaultCategories,
      departments: defaultDepartments
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};