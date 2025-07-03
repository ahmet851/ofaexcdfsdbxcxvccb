import React from 'react';
import { Edit, Trash2, User, Monitor, Mail, Phone, MapPin } from 'lucide-react';
import { Personnel, useApp } from '../../contexts/AppContext';

interface PersonnelListProps {
  personnel: Personnel[];
  onEdit: (personnelId: string) => void;
  onAssign: (personnelId: string) => void;
}

export const PersonnelList: React.FC<PersonnelListProps> = ({ personnel, onEdit, onAssign }) => {
  const { deletePersonnel } = useApp();

  if (personnel.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Personel bulunamadı</h3>
        <p className="text-gray-500 dark:text-gray-400">Arama veya filtre kriterlerinizi ayarlayın.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {personnel.map((person) => (
        <div key={person.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{person.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{person.title}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(person.id)}
                className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Personeli düzenle"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => deletePersonnel(person.id)}
                className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Personeli sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{person.department}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{person.email}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{person.phone}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Monitor className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {person.assignedDevices.length} cihaz zimmetli
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onAssign(person.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <Monitor className="h-4 w-4" />
              Zimmet Yönetimi
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};