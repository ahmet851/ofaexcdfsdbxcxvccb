import { supabase, TABLES } from './supabase';
import { Device, Personnel, Assignment } from '../contexts/AppContext';

// Device operations
export const deviceService = {
  async getAll(): Promise<Device[]> {
    const { data, error } = await supabase
      .from(TABLES.DEVICES)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Cihaz verilerini getirme hatası:', error);
      throw error;
    }
    return data?.map(this.mapFromDB) || [];
  },

  async create(device: Omit<Device, 'id' | 'createdAt'>): Promise<Device> {
    const { data, error } = await supabase
      .from(TABLES.DEVICES)
      .insert([{
        brand: device.brand,
        category: device.category,
        serial_number: device.serialNumber,
        status: device.status,
        assigned_to: device.assignedTo,
        assigned_date: device.assignedDate,
        specifications: device.specifications || {},
        maintenance_date: device.maintenanceDate
      }])
      .select()
      .single();

    if (error) {
      console.error('Cihaz oluşturma hatası:', error);
      throw error;
    }
    return this.mapFromDB(data);
  },

  async update(id: string, updates: Partial<Device>): Promise<Device> {
    const updateData: any = {};
    
    if (updates.brand !== undefined) updateData.brand = updates.brand;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.serialNumber !== undefined) updateData.serial_number = updates.serialNumber;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;
    if (updates.assignedDate !== undefined) updateData.assigned_date = updates.assignedDate;
    if (updates.specifications !== undefined) updateData.specifications = updates.specifications;
    if (updates.maintenanceDate !== undefined) updateData.maintenance_date = updates.maintenanceDate;

    const { data, error } = await supabase
      .from(TABLES.DEVICES)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Cihaz güncelleme hatası:', error);
      throw error;
    }
    return this.mapFromDB(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.DEVICES)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Cihaz silme hatası:', error);
      throw error;
    }
  },

  mapFromDB(data: any): Device {
    return {
      id: data.id,
      brand: data.brand,
      category: data.category,
      serialNumber: data.serial_number,
      status: data.status,
      assignedTo: data.assigned_to,
      assignedDate: data.assigned_date ? new Date(data.assigned_date) : undefined,
      specifications: data.specifications || {},
      maintenanceDate: data.maintenance_date ? new Date(data.maintenance_date) : undefined,
      createdAt: new Date(data.created_at)
    };
  }
};

// Personnel operations
export const personnelService = {
  async getAll(): Promise<Personnel[]> {
    const { data, error } = await supabase
      .from(TABLES.PERSONNEL)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Personel verilerini getirme hatası:', error);
      throw error;
    }
    return data?.map(this.mapFromDB) || [];
  },

  async create(person: Omit<Personnel, 'id' | 'assignedDevices' | 'assignmentHistory'>): Promise<Personnel> {
    const { data, error } = await supabase
      .from(TABLES.PERSONNEL)
      .insert([{
        name: person.name,
        department: person.department,
        title: person.title,
        email: person.email,
        phone: person.phone,
        assigned_devices: [],
        assignment_history: []
      }])
      .select()
      .single();

    if (error) {
      console.error('Personel oluşturma hatası:', error);
      throw error;
    }
    return this.mapFromDB(data);
  },

  async update(id: string, updates: Partial<Personnel>): Promise<Personnel> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.department !== undefined) updateData.department = updates.department;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.assignedDevices !== undefined) updateData.assigned_devices = updates.assignedDevices;
    if (updates.assignmentHistory !== undefined) updateData.assignment_history = updates.assignmentHistory;

    const { data, error } = await supabase
      .from(TABLES.PERSONNEL)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Personel güncelleme hatası:', error);
      throw error;
    }
    return this.mapFromDB(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.PERSONNEL)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Personel silme hatası:', error);
      throw error;
    }
  },

  mapFromDB(data: any): Personnel {
    return {
      id: data.id,
      name: data.name,
      department: data.department,
      title: data.title,
      email: data.email,
      phone: data.phone,
      assignedDevices: data.assigned_devices || [],
      assignmentHistory: data.assignment_history || []
    };
  }
};

// Assignment operations
export const assignmentService = {
  async getAll(): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from(TABLES.ASSIGNMENTS)
      .select('*')
      .order('assigned_date', { ascending: false });
    
    if (error) {
      console.error('Zimmet verilerini getirme hatası:', error);
      throw error;
    }
    return data?.map(this.mapFromDB) || [];
  },

  async create(assignment: Omit<Assignment, 'id'>): Promise<Assignment> {
    const { data, error } = await supabase
      .from(TABLES.ASSIGNMENTS)
      .insert([{
        device_id: assignment.deviceId,
        personnel_id: assignment.personnelId,
        assigned_date: assignment.assignedDate,
        returned_date: assignment.returnedDate,
        status: assignment.status,
        notes: assignment.notes
      }])
      .select()
      .single();

    if (error) {
      console.error('Zimmet oluşturma hatası:', error);
      throw error;
    }
    return this.mapFromDB(data);
  },

  async update(id: string, updates: Partial<Assignment>): Promise<Assignment> {
    const updateData: any = {};
    
    if (updates.deviceId !== undefined) updateData.device_id = updates.deviceId;
    if (updates.personnelId !== undefined) updateData.personnel_id = updates.personnelId;
    if (updates.assignedDate !== undefined) updateData.assigned_date = updates.assignedDate;
    if (updates.returnedDate !== undefined) updateData.returned_date = updates.returnedDate;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from(TABLES.ASSIGNMENTS)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Zimmet güncelleme hatası:', error);
      throw error;
    }
    return this.mapFromDB(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.ASSIGNMENTS)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Zimmet silme hatası:', error);
      throw error;
    }
  },

  mapFromDB(data: any): Assignment {
    return {
      id: data.id,
      deviceId: data.device_id,
      personnelId: data.personnel_id,
      assignedDate: new Date(data.assigned_date),
      returnedDate: data.returned_date ? new Date(data.returned_date) : undefined,
      status: data.status,
      notes: data.notes
    };
  }
};