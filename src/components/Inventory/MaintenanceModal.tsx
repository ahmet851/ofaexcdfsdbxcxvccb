import React, { useState } from 'react';
import { X, Wrench, Plus, Calendar, DollarSign, User, FileText, Clock } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MaintenanceModalProps {
  itemId: string;
  onClose: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ itemId, onClose }) => {
  const { inventoryItems, maintenanceRecords, addMaintenanceRecord, updateMaintenanceRecord } = useInventory();
  const [activeTab, setActiveTab] = useState<'history' | 'add'>('history');
  const [formData, setFormData] = useState({
    maintenanceType: 'repair' as const,
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'scheduled' as const,
    cost: '',
    technician: '',
    supplierService: '',
    notes: ''
  });

  const item = inventoryItems.find(i => i.id === itemId);
  const itemMaintenanceRecords = maintenanceRecords.filter(record => record.inventoryItemId === itemId);

  const formatTurkishDate = (date: Date) => {
    return format(date, 'dd.MM.yyyy', { locale: tr });
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Planlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      case 'in_progress':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200';
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const maintenanceData = {
        inventoryItemId: itemId,
        maintenanceType: formData.maintenanceType,
        description: formData.description,
        startDate: new Date(formData.startDate),
        status: formData.status,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        technician: formData.technician || undefined,
        supplierService: formData.supplierService || undefined,
        notes: formData.notes || undefined
      };

      await addMaintenanceRecord(maintenanceData);
      
      // Reset form
      setFormData({
        maintenanceType: 'repair',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        status: 'scheduled',
        cost: '',
        technician: '',
        supplierService: '',
        notes: ''
      });
      
      setActiveTab('history');
    } catch (error) {
      console.error('Bakım kaydı ekleme hatası:', error);
    }
  };

  const handleStatusUpdate = async (recordId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completionDate = new Date();
      }
      await updateMaintenanceRecord(recordId, updates);
    } catch (error) {
      console.error('Bakım durumu güncelleme hatası:', error);
    }
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bakım Yönetimi</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.itemName} • {item.serialNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bakım Geçmişi ({itemMaintenanceRecords.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'add'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Yeni Bakım Ekle
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Maintenance History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Bakım Geçmişi ({itemMaintenanceRecords.length})
              </h3>
              {itemMaintenanceRecords.length > 0 ? (
                <div className="space-y-4">
                  {itemMaintenanceRecords
                    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                    .map(record => (
                      <div key={record.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {getMaintenanceTypeText(record.maintenanceType)}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {record.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                              {getStatusText(record.status)}
                            </span>
                            {record.status === 'scheduled' && (
                              <button
                                onClick={() => handleStatusUpdate(record.id, 'in_progress')}
                                className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors"
                              >
                                Başlat
                              </button>
                            )}
                            {record.status === 'in_progress' && (
                              <button
                                onClick={() => handleStatusUpdate(record.id, 'completed')}
                                className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900/40 transition-colors"
                              >
                                Tamamla
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>Başlangıç: {formatTurkishDate(record.startDate)}</span>
                          </div>
                          
                          {record.completionDate && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span>Bitiş: {formatTurkishDate(record.completionDate)}</span>
                            </div>
                          )}
                          
                          {record.technician && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <User className="h-4 w-4" />
                              <span>{record.technician}</span>
                            </div>
                          )}
                          
                          {record.cost && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <DollarSign className="h-4 w-4" />
                              <span>₺{record.cost.toLocaleString('tr-TR')}</span>
                            </div>
                          )}
                        </div>
                        
                        {record.notes && (
                          <div className="mt-3 p-3 bg-white dark:bg-gray-600 rounded text-sm text-gray-600 dark:text-gray-300">
                            <strong>Notlar:</strong> {record.notes}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Henüz bakım kaydı yok</p>
                  <p className="text-sm">Yeni bakım eklemek için "Yeni Bakım Ekle" sekmesini kullanın</p>
                </div>
              )}
            </div>
          )}

          {/* Add Maintenance Tab */}
          {activeTab === 'add' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Yeni Bakım Kaydı Ekle</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bakım Türü *
                    </label>
                    <select
                      required
                      value={formData.maintenanceType}
                      onChange={(e) => setFormData(prev => ({ ...prev, maintenanceType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="repair">Onarım</option>
                      <option value="preventive">Önleyici Bakım</option>
                      <option value="inspection">İnceleme</option>
                      <option value="replacement">Değiştirme</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Durum
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="scheduled">Planlandı</option>
                      <option value="in_progress">Devam Ediyor</option>
                      <option value="completed">Tamamlandı</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Bakım açıklamasını girin..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Başlangıç Tarihi *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maliyet (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teknisyen
                    </label>
                    <input
                      type="text"
                      value={formData.technician}
                      onChange={(e) => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Teknisyen adı"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Servis Sağlayıcı
                  </label>
                  <input
                    type="text"
                    value={formData.supplierService}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierService: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Servis sağlayıcı firma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ek Notlar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ek notlar..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Bakım Kaydı Ekle
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};