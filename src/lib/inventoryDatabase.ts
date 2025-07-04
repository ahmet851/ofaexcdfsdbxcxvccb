import { supabase } from './supabase';
import { InventoryItem, MaintenanceRecord, AuditRecord } from '../contexts/InventoryContext';

// Inventory items operations
export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Envanter verilerini getirme hatası:', error);
      throw error;
    }
    return data?.map(this.mapFromDB) || [];
  },

  async create(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{
        item_name: item.itemName,
        serial_number: item.serialNumber,
        purchase_date: item.purchaseDate,
        current_status: item.currentStatus,
        location_department: item.locationDepartment,
        warranty_start_date: item.warrantyStartDate,
        warranty_end_date: item.warrantyEndDate,
        warranty_provider: item.warrantyProvider,
        purchase_price: item.purchasePrice,
        supplier: item.supplier,
        category: item.category,
        brand: item.brand,
        model: item.model,
        specifications: item.specifications || {},
        notes: item.notes
      }])
      .select()
      .single();

    if (error) {
      console.error('Envanter öğesi oluşturma hatası:', error);
      throw error;
    }
    return this.mapFromDB(data);
  },

  async update(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const updateData: any = {};
    
    if (updates.itemName !== undefined) updateData.item_name = updates.itemName;
    if (updates.serialNumber !== undefined) updateData.serial_number = updates.serialNumber;
    if (updates.purchaseDate !== undefined) updateData.purchase_date = updates.purchaseDate;
    if (updates.currentStatus !== undefined) updateData.current_status = updates.currentStatus;
    if (updates.locationDepartment !== undefined) updateData.location_department = updates.locationDepartment;
    if (updates.warrantyStartDate !== undefined) updateData.warranty_start_date = updates.warrantyStartDate;
    if (updates.warrantyEndDate !== undefined) updateData.warranty_end_date = updates.warrantyEndDate;
    if (updates.warrantyProvider !== undefined) updateData.warranty_provider = updates.warrantyProvider;
    if (updates.purchasePrice !== undefined) updateData.purchase_price = updates.purchasePrice;
    if (updates.supplier !== undefined) updateData.supplier = updates.supplier;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.brand !== undefined) updateData.brand = updates.brand;
    if (updates.model !== undefined) updateData.model = updates.model;
    if (updates.specifications !== undefined) updateData.specifications = updates.specifications;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Envanter öğesi güncelleme hatası:', error);
      throw error;
    }
    return this.mapFromDB(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Envanter öğesi silme hatası:', error);
      throw error;
    }
  },

  mapFromDB(data: any): InventoryItem {
    return {
      id: data.id,
      itemName: data.item_name,
      serialNumber: data.serial_number,
      purchaseDate: data.purchase_date ? new Date(data.purchase_date) : undefined,
      currentStatus: data.current_status,
      locationDepartment: data.location_department,
      warrantyStartDate: data.warranty_start_date ? new Date(data.warranty_start_date) : undefined,
      warrantyEndDate: data.warranty_end_date ? new Date(data.warranty_end_date) : undefined,
      warrantyProvider: data.warranty_provider,
      purchasePrice: data.purchase_price,
      supplier: data.supplier,
      category: data.category,
      brand: data.brand,
      model: data.model,
      specifications: data.specifications || {},
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
};

// Maintenance records operations
export const maintenanceService = {
  async getAll(): Promise<MaintenanceRecord[]> {
    const { data, error } = await supabase
      .from('inventory_maintenance')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Bakım verilerini getirme hatası:', error);
      throw error;
    }
    return data?.map(this.mapFromDB) || [];
  },

  async create(record: Omit<MaintenanceRecord, 'id' | 'createdAt'>): Promise<MaintenanceRecord> {
    const { data, error } = await supabase
      .from('inventory_maintenance')
      .insert([{
        inventory_item_id: record.inventoryItemId,
        maintenance_type: record.maintenanceType,
        description: record.description,
        start_date: record.startDate,
        completion_date: record.completionDate,
        status: record.status,
        cost: record.cost,
        technician: record.technician,
        supplier_service: record.supplierService,
        notes: record.notes
      }])
      .select()
      .single();

    if (error) {
      console.error('Bakım kaydı oluşturma hatası:', error);
      throw error;
    }
    return this.mapFromDB(data);
  },

  async update(id: string, updates: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const updateData: any = {};
    
    if (updates.maintenanceType !== undefined) updateData.maintenance_type = updates.maintenanceType;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if (updates.completionDate !== undefined) updateData.completion_date = updates.completionDate;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.cost !== undefined) updateData.cost = updates.cost;
    if (updates.technician !== undefined) updateData.technician = updates.technician;
    if (updates.supplierService !== undefined) updateData.supplier_service = updates.supplierService;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from('inventory_maintenance')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Bakım kaydı güncelleme hatası:', error);
      throw error;
    }
    return this.mapFromDB(data);
  },

  mapFromDB(data: any): MaintenanceRecord {
    return {
      id: data.id,
      inventoryItemId: data.inventory_item_id,
      maintenanceType: data.maintenance_type,
      description: data.description,
      startDate: new Date(data.start_date),
      completionDate: data.completion_date ? new Date(data.completion_date) : undefined,
      status: data.status,
      cost: data.cost,
      technician: data.technician,
      supplierService: data.supplier_service,
      notes: data.notes,
      createdAt: new Date(data.created_at)
    };
  }
};

// Audit records operations
export const auditService = {
  async getAll(): Promise<AuditRecord[]> {
    const { data, error } = await supabase
      .from('inventory_audit')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Denetim verilerini getirme hatası:', error);
      throw error;
    }
    return data?.map(this.mapFromDB) || [];
  },

  async create(record: Omit<AuditRecord, 'id' | 'createdAt'>): Promise<AuditRecord> {
    const { data, error } = await supabase
      .from('inventory_audit')
      .insert([{
        inventory_item_id: record.inventoryItemId,
        action: record.action,
        old_values: record.oldValues,
        new_values: record.newValues,
        changed_by: record.changedBy,
        change_reason: record.changeReason
      }])
      .select()
      .single();

    if (error) {
      console.error('Denetim kaydı oluşturma hatası:', error);
      throw error;
    }
    return this.mapFromDB(data);
  },

  mapFromDB(data: any): AuditRecord {
    return {
      id: data.id,
      inventoryItemId: data.inventory_item_id,
      action: data.action,
      oldValues: data.old_values,
      newValues: data.new_values,
      changedBy: data.changed_by,
      changeReason: data.change_reason,
      createdAt: new Date(data.created_at)
    };
  }
};