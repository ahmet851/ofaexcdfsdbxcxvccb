import React, { useState } from 'react';
import { Plus, Search, Filter, QrCode, Download, Upload } from 'lucide-react';
import { DeviceList } from './DeviceList';
import { DeviceForm } from './DeviceForm';
import { ImportModal } from './ImportModal';
import { useApp } from '../../contexts/AppContext';
import { exportToExcel } from '../../lib/exportUtils';

export const DeviceManagement: React.FC = () => {
  const { devices, categories } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (device.assignedTo && device.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || device.category === filterCategory;
    const matchesStatus = !filterStatus || device.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (deviceId: string) => {
    setEditingDevice(deviceId);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDevice(null);
  };

  const handleExportDevices = () => {
    exportToExcel.devices(filteredDevices);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cihaz Yönetimi</h2>
          <p className="text-gray-600 dark:text-gray-400">Tüm IT varlıklarını yönetin ve takip edin</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Upload className="h-4 w-4" />
            İçe Aktar
          </button>
          <button
            onClick={handleExportDevices}
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
            Cihaz Ekle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{devices.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Cihaz</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-emerald-600">{devices.filter(d => d.status === 'available').length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Müsait</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{devices.filter(d => d.status === 'assigned').length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Zimmetli</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-amber-600">{devices.filter(d => d.status === 'maintenance').length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Bakımda</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cihaz, seri numarası veya zimmetli kişi ara..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tüm Durumlar</option>
              <option value="available">Müsait</option>
              <option value="assigned">Zimmetli</option>
              <option value="maintenance">Bakımda</option>
              <option value="retired">Emekli</option>
            </select>
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <QrCode className="h-4 w-4" />
              Tara
            </button>
          </div>
        </div>
      </div>

      {/* Device List */}
      <DeviceList 
        devices={filteredDevices} 
        onEdit={handleEdit}
      />

      {/* Device Form Modal */}
      {showForm && (
        <DeviceForm
          deviceId={editingDevice}
          onClose={handleCloseForm}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
};