import React, { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import { useApp, Personnel } from '../../contexts/AppContext';

interface PersonnelFormProps {
  personnelId?: string | null;
  onClose: () => void;
}

export const PersonnelForm: React.FC<PersonnelFormProps> = ({ personnelId, onClose }) => {
  const { personnel, addPersonnel, updatePersonnel, departments } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    title: '',
    email: '',
    phone: ''
  });

  const isEditing = Boolean(personnelId);
  const person = personnelId ? personnel.find(p => p.id === personnelId) : null;

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name,
        department: person.department,
        title: person.title,
        email: person.email,
        phone: person.phone
      });
    }
  }, [person]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && personnelId) {
        await updatePersonnel(personnelId, formData);
      } else {
        await addPersonnel(formData);
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
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ad Soyad
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ad soyad girin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Departman
            </label>
            <select
              required
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
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
              Ünvan
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="örn: Müdür, Teknisyen, Koordinatör"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              E-posta Adresi
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="email@otel.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Telefon Numarası
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+90-555-0123"
            />
          </div>

          <div className="flex gap-3 pt-4">
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