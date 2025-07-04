import React, { useState } from 'react';
import { Package, Plus, Search, Filter, Download, Upload, AlertTriangle, Wrench, CheckCircle, Clock } from 'lucide-react';
import { InventoryList } from './InventoryList';
import { InventoryForm } from './InventoryForm';
import { MaintenanceModal } from './MaintenanceModal';
import { useInventory } from '../../contexts/InventoryContext';
import { exportInventoryToExcel } from '../../lib/inventoryExportUtils';

export const InventoryManagement: React.FC = () => {
  const { inventoryItems, maintenanceRecords, categories, departments } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [activeView, setActiveView] = useState<'all' | 'active' | 'defective' | 'repair' | 'history'>('all');

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesStatus = !filterStatus || item.currentStatus === filterStatus;
    const matchesDepartment = !filterDepartment || item.locationDepartment === filterDepartment;
    
    // View-based filtering
    let matchesView = true;
    switch (activeView) {
      case 'active':
        matchesView = item.currentStatus === 'in_stock';
        break;
      case 'defective':
        matchesView = item.currentStatus === 'defective';
        break;
      case 'repair':
        matchesView = item.currentStatus === 'under_repair';
        break;
      case 'history':
        matchesView = item.currentStatus === 'disposed';
        break;
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDepartment && matchesView;
  });

  const stats = {
    total: inventoryItems.length,
    inStock: inventoryItems.filter(item => item.currentStatus === 'in_stock').length,
    defective: inventoryItems.filter(item => item.currentStatus === 'defective').length,
    underRepair: inventoryItems.filter(item => item.currentStatus === 'under_repair').length,
    disposed: inventoryItems.filter(item => item.currentStatus === 'disposed').length,
    activeMaintenance: maintenanceRecords.filter(record => record.status === 'in_progress').length
  };

  const handleEdit = (itemId: string) => {
    setEditingItem(itemId);
    setShowForm(true);
  };

  const handleMaintenance = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowMaintenanceModal(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleCloseMaintenance = () => {
    setShowMaintenanceModal(false);
    setSelectedItemId(null);
  };

  const handleExport = () => {
    exportInventoryToExcel.all(filteredItems, maintenanceRecords);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return 'Stokta';
      case 'defective': return 'Arızalı';
      case 'under_repair': return 'Onarımda';
      case 'disposed': return 'İmha Edildi';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Envanter Yönetimi</h2>
          <p className="text-gray-600 dark:text-gray-400">Tüm envanter öğelerini takip edin ve yönetin</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Dışa Aktar
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Envanter Ekle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stokta</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.inStock}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Arızalı</p>
              <p className="text-2xl font-bold text-red-600">{stats.defective}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Onarımda</p>
              <p className="text-2xl font-bold text-amber-600">{stats.underRepair}</p>
            </div>
            <Wrench className="h-6 w-6 text-amber-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">İmha Edildi</p>
              <p className="text-2xl font-bold text-gray-600">{stats.disposed}</p>
            </div>
            <Clock className="h-6 w-6 text-gray-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Bakım</p>
              <p className="text-2xl font-bold text-purple-600">{stats.activeMaintenance}</p>
            </div>
            <Wrench className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex px-6">
            {[
              { id: 'all', label: 'Tümü', count: stats.total },
              { id: 'active', label: 'Aktif Envanter', count: stats.inStock },
              { id: 'defective', label: 'Arızalı Ekipman', count: stats.defective },
              { id: 'repair', label: 'Onarımda', count: stats.underRepair },
              { id: 'history', label: 'Geçmiş', count: stats.disposed }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Envanter ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Departmanlar</option>
                {departments.map(department => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Durumlar</option>
                <option value="in_stock">Stokta</option>
                <option value="defective">Arızalı</option>
                <option value="under_repair">Onarımda</option>
                <option value="disposed">İmha Edildi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <InventoryList 
        items={filteredItems} 
        onEdit={handleEdit}
        onMaintenance={handleMaintenance}
      />

      {/* Modals */}
      {showForm && (
        <InventoryForm
          itemId={editingItem}
          onClose={handleCloseForm}
        />
      )}

      {showMaintenanceModal && selectedItemId && (
        <MaintenanceModal
          itemId={selectedItemId}
          onClose={handleCloseMaintenance}
        />
      )}
    </div>
  );
};