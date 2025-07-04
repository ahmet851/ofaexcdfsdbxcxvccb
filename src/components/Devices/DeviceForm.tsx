import React, { useState, useEffect } from 'react';
import { X, Camera, Save } from 'lucide-react';
import { useApp, Device } from '../../contexts/AppContext';

interface DeviceFormProps {
  deviceId?: string | null;
  onClose: () => void;
}

export const DeviceForm: React.FC<DeviceFormProps> = ({ deviceId, onClose }) => {
  const { devices, addDevice, updateDevice, categories } = useApp();
  const [formData, setFormData] = useState({
    brand: '',
    category: '',
    serialNumber: '',
    status: 'available' as Device['status'],
    specifications: {
      ram: '',
      processor: '',
      generation: '',
      storageType: '',
      storageCapacity: ''
    }
  });

  const isEditing = Boolean(deviceId);
  const device = deviceId ? devices.find(d => d.id === deviceId) : null;

  useEffect(() => {
    if (device) {
      setFormData({
        brand: device.brand,
        category: device.category,
        serialNumber: device.serialNumber,
        status: device.status,
        specifications: {
          ram: device.specifications.ram || '',
          processor: device.specifications.processor || '',
          generation: device.specifications.generation || '',
          storageType: device.specifications.storageType || '',
          storageCapacity: device.specifications.storageCapacity || ''
        }
      });
    }
  }, [device]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && deviceId) {
        await updateDevice(deviceId, formData);
      } else {
        await addDevice(formData);
      }
      onClose();
    } catch (error) {
      console.error('Form gönderme hatası:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('specifications.')) {
      const specField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const simulateSerialScan = () => {
    const randomSerial = 'SN' + Math.random().toString(36).substr(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, serialNumber: randomSerial }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Cihazı Düzenle' : 'Yeni Cihaz Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marka
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="örn: Dell, HP, Apple"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seri Numarası
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Seri numarasını girin"
              />
              <button
                type="button"
                onClick={simulateSerialScan}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Camera className="h-4 w-4" />
                Tara
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Durum
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="available">Müsait</option>
              <option value="assigned">Zimmetli</option>
              <option value="maintenance">Bakımda</option>
              <option value="retired">Emekli</option>
            </select>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Donanım Özellikleri</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RAM
                </label>
                <select
                  value={formData.specifications.ram}
                  onChange={(e) => handleChange('specifications.ram', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">RAM Seçin</option>
                  <option value="4GB">4GB</option>
                  <option value="8GB">8GB</option>
                  <option value="16GB">16GB</option>
                  <option value="32GB">32GB</option>
                  <option value="64GB">64GB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İşlemci
                </label>
                <select
                  value={formData.specifications.processor}
                  onChange={(e) => handleChange('specifications.processor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">İşlemci Seçin</option>
                  <option value="Intel Core i3">Intel Core i3</option>
                  <option value="Intel Core i5">Intel Core i5</option>
                  <option value="Intel Core i7">Intel Core i7</option>
                  <option value="Intel Core i9">Intel Core i9</option>
                  <option value="AMD Ryzen 3">AMD Ryzen 3</option>
                  <option value="AMD Ryzen 5">AMD Ryzen 5</option>
                  <option value="AMD Ryzen 7">AMD Ryzen 7</option>
                  <option value="AMD Ryzen 9">AMD Ryzen 9</option>
                  <option value="Apple M1">Apple M1</option>
                  <option value="Apple M2">Apple M2</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İşlemci Nesli
                </label>
                <select
                  value={formData.specifications.generation}
                  onChange={(e) => handleChange('specifications.generation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Nesil Seçin</option>
                  <option value="5. Nesil">5. Nesil</option>
                  <option value="7. Nesil">7. Nesil</option>
                  <option value="8. Nesil">8. Nesil</option>
                  <option value="9. Nesil">9. Nesil</option>
                  <option value="10. Nesil">10. Nesil</option>
                  <option value="11. Nesil">11. Nesil</option>
                  <option value="12. Nesil">12. Nesil</option>
                  <option value="13. Nesil">13. Nesil</option>
                  <option value="14. Nesil">14. Nesil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Depolama Tipi
                </label>
                <select
                  value={formData.specifications.storageType}
                  onChange={(e) => handleChange('specifications.storageType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Depolama Tipi Seçin</option>
                  <option value="SSD">SSD</option>
                  <option value="HDD">HDD</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Depolama Kapasitesi
              </label>
              <select
                value={formData.specifications.storageCapacity}
                onChange={(e) => handleChange('specifications.storageCapacity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Kapasite Seçin</option>
                <option value="256GB">256 GB</option>
                <option value="500GB">500 GB</option>
                <option value="1TB">1 TB</option>
                <option value="2TB">2 TB</option>
              </select>
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