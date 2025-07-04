import React, { useState, useEffect } from 'react';
import { X, Save, Package, Calendar, DollarSign } from 'lucide-react';
import { useInventory, InventoryItem } from '../../contexts/InventoryContext';

interface InventoryFormProps {
  itemId?: string | null;
  onClose: () => void;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({ itemId, onClose }) => {
  const { inventoryItems, addInventoryItem, updateInventoryItem, categories, departments } = useInventory();
  const [formData, setFormData] = useState({
    itemName: '',
    serialNumber: '',
    purchaseDate: '',
    currentStatus: 'in_stock' as InventoryItem['currentStatus'],
    locationDepartment: '',
    warrantyStartDate: '',
    warrantyEndDate: '',
    warrantyProvider: '',
    purchasePrice: '',
    supplier: '',
    category: '',
    brand: '',
    model: '',
    specifications: {},
    notes: ''
  });

  const isEditing = Boolean(itemId);
  const item = itemId ? inventoryItems.find(i => i.id === itemId) : null;

  useEffect(() => {
    if (item) {
      setFormData({
        itemName: item.itemName,
        serialNumber: item.serialNumber,
        purchaseDate: item.purchaseDate ? item.purchaseDate.toISOString().split('T')[0] : '',
        currentStatus: item.currentStatus,
        locationDepartment: item.locationDepartment,
        warrantyStartDate: item.warrantyStartDate ? item.warrantyStartDate.toISOString().split('T')[0] : '',
        warrantyEndDate: item.warrantyEndDate ? item.warrantyEndDate.toISOString().split('T')[0] : '',
        warrantyProvider: item.warrantyProvider || '',
        purchasePrice: item.purchasePrice?.toString() || '',
        supplier: item.supplier || '',
        category: item.category,
        brand: item.brand || '',
        model: item.model || '',
        specifications: item.specifications || {},
        notes: item.notes || ''
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemData = {
        itemName: formData.itemName,
        serialNumber: formData.serialNumber,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined,
        currentStatus: formData.currentStatus,
        locationDepartment: formData.locationDepartment,
        warrantyStartDate: formData.warrantyStartDate ? new Date(formData.warrantyStartDate) : undefined,
        warrantyEndDate: formData.warrantyEndDate ? new Date(formData.warrantyEndDate) : undefined,
        warrantyProvider: formData.warrantyProvider || undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        supplier: formData.supplier || undefined,
        category: formData.category,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        specifications: formData.specifications,
        notes: formData.notes || undefined
      };

      if (isEditing && itemId) {
        await updateInventoryItem(itemId, itemData);
      } else {
        await addInventoryItem(itemData);
      }
      onClose();
    } catch (error) {
      console.error('Form gönderme hatası:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Envanter Öğesini Düzenle' : 'Yeni Envanter Öğesi Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Öğe Adı *
              </label>
              <input
                type="text"
                required
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Öğe adını girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seri Numarası *
              </label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Seri numarasını girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Kategori Seçin</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lokasyon/Departman *
              </label>
              <select
                required
                value={formData.locationDepartment}
                onChange={(e) => handleChange('locationDepartment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Departman Seçin</option>
                {departments.map(department => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marka
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Marka adını girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Model adını girin"
              />
            </div>
          </div>

          {/* Purchase Information */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Satın Alma Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Satın Alma Tarihi
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleChange('purchaseDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Satın Alma Fiyatı (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => handleChange('purchasePrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tedarikçi
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tedarikçi adını girin"
                />
              </div>
            </div>
          </div>

          {/* Warranty Information */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Garanti Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Garanti Başlangıç
                </label>
                <input
                  type="date"
                  value={formData.warrantyStartDate}
                  onChange={(e) => handleChange('warrantyStartDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Garanti Bitiş
                </label>
                <input
                  type="date"
                  value={formData.warrantyEndDate}
                  onChange={(e) => handleChange('warrantyEndDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Garanti Sağlayıcı
                </label>
                <input
                  type="text"
                  value={formData.warrantyProvider}
                  onChange={(e) => handleChange('warrantyProvider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Garanti sağlayıcısını girin"
                />
              </div>
            </div>
          </div>

          {/* Status and Notes */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durum
                </label>
                <select
                  value={formData.currentStatus}
                  onChange={(e) => handleChange('currentStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="in_stock">Stokta</option>
                  <option value="defective">Arızalı</option>
                  <option value="under_repair">Onarımda</option>
                  <option value="disposed">İmha Edildi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ek notlar..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              {isEditing ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};