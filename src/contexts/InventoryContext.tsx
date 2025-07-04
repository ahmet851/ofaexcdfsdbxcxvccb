import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { inventoryService, maintenanceService, auditService } from '../lib/inventoryDatabase';
import { supabase } from '../lib/supabase';

export interface InventoryItem {
  id: string;
  itemName: string;
  serialNumber: string;
  purchaseDate?: Date;
  currentStatus: 'in_stock' | 'defective' | 'under_repair' | 'disposed';
  locationDepartment: string;
  warrantyStartDate?: Date;
  warrantyEndDate?: Date;
  warrantyProvider?: string;
  purchasePrice?: number;
  supplier?: string;
  category: string;
  brand?: string;
  model?: string;
  specifications: Record<string, any>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  inventoryItemId: string;
  maintenanceType: 'repair' | 'preventive' | 'inspection' | 'replacement';
  description: string;
  startDate: Date;
  completionDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  cost?: number;
  technician?: string;
  supplierService?: string;
  notes?: string;
  createdAt: Date;
}

export interface AuditRecord {
  id: string;
  inventoryItemId: string;
  action: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedBy: string;
  changeReason?: string;
  createdAt: Date;
}

interface InventoryContextType {
  inventoryItems: InventoryItem[];
  maintenanceRecords: MaintenanceRecord[];
  auditRecords: AuditRecord[];
  loading: boolean;
  error: string | null;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => Promise<void>;
  markAsDefective: (id: string, reason: string) => Promise<void>;
  markAsRepaired: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  categories: string[];
  departments: string[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const defaultCategories = ['Masaüstü', 'Laptop', 'Monitör', 'Yazıcı', 'Telefon', 'Tablet', 'Kamera', 'Ses Ekipmanı', 'Ağ Ekipmanı', 'Mobilya', 'Aydınlatma', 'Klima', 'Güvenlik', 'Diğer'];
const defaultDepartments = ['CRM', 'Animasyon', 'I.T', 'Ses/Görüntü', 'Misafir ilişkileri', 'Mutfak', 'Ön Büro', 'Temizlik', 'Bakım', 'Güvenlik', 'Yönetim', 'SPA', 'TEKNİK SERVİS', 'SATIN ALMA', 'H.K', 'İK', 'F&B'];

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Envanter verileri yükleniyor...');
      
      const [itemsData, maintenanceData, auditData] = await Promise.all([
        inventoryService.getAll(),
        maintenanceService.getAll(),
        auditService.getAll()
      ]);

      setInventoryItems(itemsData);
      setMaintenanceRecords(maintenanceData);
      setAuditRecords(auditData);
      
      console.log('Envanter verileri başarıyla yüklendi:', {
        items: itemsData.length,
        maintenance: maintenanceData.length,
        audit: auditData.length
      });
    } catch (err) {
      console.error('Envanter veri yükleme hatası:', err);
      setError('Envanter verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Real-time subscriptions
    const inventorySubscription = supabase
      .channel('inventory_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'inventory_items' 
      }, (payload) => {
        console.log('Envanter değişikliği:', payload);
        refreshData();
      })
      .subscribe();

    const maintenanceSubscription = supabase
      .channel('maintenance_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'inventory_maintenance' 
      }, (payload) => {
        console.log('Bakım değişikliği:', payload);
        refreshData();
      })
      .subscribe();

    return () => {
      inventorySubscription.unsubscribe();
      maintenanceSubscription.unsubscribe();
    };
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Yeni envanter öğesi ekleniyor:', itemData);
      
      const newItem = await inventoryService.create(itemData);
      setInventoryItems(prev => [newItem, ...prev]);
      
      // Add audit record
      try {
        await auditService.create({
          inventoryItemId: newItem.id,
          action: 'CREATE',
          newValues: itemData,
          changedBy: 'Sistem Yöneticisi',
          changeReason: 'Yeni envanter öğesi eklendi'
        });
      } catch (auditError) {
        console.warn('Denetim kaydı eklenirken hata oluştu:', auditError);
        // Audit hatası ana işlemi etkilemez
      }
      
      console.log('Envanter öğesi başarıyla eklendi:', newItem);
    } catch (err) {
      console.error('Envanter öğesi ekleme hatası:', err);
      setError('Envanter öğesi eklenirken bir hata oluştu');
      throw err;
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const oldItem = inventoryItems.find(item => item.id === id);
      const updatedItem = await inventoryService.update(id, updates);
      setInventoryItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
      
      // Add audit record
      if (oldItem) {
        try {
          await auditService.create({
            inventoryItemId: id,
            action: 'UPDATE',
            oldValues: oldItem,
            newValues: updates,
            changedBy: 'Sistem Yöneticisi',
            changeReason: 'Envanter öğesi güncellendi'
          });
        } catch (auditError) {
          console.warn('Denetim kaydı eklenirken hata oluştu:', auditError);
        }
      }
      
      console.log('Envanter öğesi başarıyla güncellendi:', updatedItem);
    } catch (err) {
      console.error('Envanter öğesi güncelleme hatası:', err);
      setError('Envanter öğesi güncellenirken bir hata oluştu');
      throw err;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    if (!confirm('Bu envanter öğesini silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await inventoryService.delete(id);
      setInventoryItems(prev => prev.filter(item => item.id !== id));
      console.log('Envanter öğesi başarıyla silindi:', id);
    } catch (err) {
      console.error('Envanter öğesi silme hatası:', err);
      setError('Envanter öğesi silinirken bir hata oluştu');
      throw err;
    }
  };

  const addMaintenanceRecord = async (recordData: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => {
    try {
      const newRecord = await maintenanceService.create(recordData);
      setMaintenanceRecords(prev => [newRecord, ...prev]);
      console.log('Bakım kaydı başarıyla eklendi:', newRecord);
    } catch (err) {
      console.error('Bakım kaydı ekleme hatası:', err);
      setError('Bakım kaydı eklenirken bir hata oluştu');
      throw err;
    }
  };

  const updateMaintenanceRecord = async (id: string, updates: Partial<MaintenanceRecord>) => {
    try {
      const updatedRecord = await maintenanceService.update(id, updates);
      setMaintenanceRecords(prev => prev.map(record => 
        record.id === id ? updatedRecord : record
      ));
      console.log('Bakım kaydı başarıyla güncellendi:', updatedRecord);
    } catch (err) {
      console.error('Bakım kaydı güncelleme hatası:', err);
      setError('Bakım kaydı güncellenirken bir hata oluştu');
      throw err;
    }
  };

  const markAsDefective = async (id: string, reason: string) => {
    try {
      await updateInventoryItem(id, { currentStatus: 'defective' });
      
      // Add maintenance record for the defect
      await addMaintenanceRecord({
        inventoryItemId: id,
        maintenanceType: 'repair',
        description: `Arızalı olarak işaretlendi: ${reason}`,
        startDate: new Date(),
        status: 'scheduled'
      });
      
      console.log('Öğe arızalı olarak işaretlendi:', id);
    } catch (err) {
      console.error('Arızalı işaretleme hatası:', err);
      throw err;
    }
  };

  const markAsRepaired = async (id: string) => {
    try {
      await updateInventoryItem(id, { currentStatus: 'in_stock' });
      
      // Update any open maintenance records
      const openMaintenance = maintenanceRecords.find(
        record => record.inventoryItemId === id && record.status === 'in_progress'
      );
      
      if (openMaintenance) {
        await updateMaintenanceRecord(openMaintenance.id, {
          status: 'completed',
          completionDate: new Date()
        });
      }
      
      console.log('Öğe onarıldı olarak işaretlendi:', id);
    } catch (err) {
      console.error('Onarım işaretleme hatası:', err);
      throw err;
    }
  };

  return (
    <InventoryContext.Provider value={{
      inventoryItems,
      maintenanceRecords,
      auditRecords,
      loading,
      error,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      addMaintenanceRecord,
      updateMaintenanceRecord,
      markAsDefective,
      markAsRepaired,
      refreshData,
      categories: defaultCategories,
      departments: defaultDepartments
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};