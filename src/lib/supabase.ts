import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are missing');
  throw new Error('Supabase configuration is incomplete');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database table names
export const TABLES = {
  DEVICES: 'devices',
  PERSONNEL: 'personnel',
  ASSIGNMENTS: 'assignments',
  INVENTORY_ITEMS: 'inventory_items',
  INVENTORY_MAINTENANCE: 'inventory_maintenance',
  INVENTORY_AUDIT: 'inventory_audit'
} as const;