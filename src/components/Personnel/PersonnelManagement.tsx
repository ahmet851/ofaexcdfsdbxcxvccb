import React, { useState } from 'react';
import { Plus, Search, Users, Mail, Phone, Download } from 'lucide-react';
import { PersonnelList } from './PersonnelList';
import { PersonnelForm } from './PersonnelForm';
import { AssignmentModal } from './AssignmentModal';
import { useApp } from '../../contexts/AppContext';
import { exportToExcel } from '../../lib/exportUtils';

export const PersonnelManagement: React.FC = () => {
  const { personnel, departments } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<string | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || person.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleEdit = (personnelId: string) => {
    setEditingPersonnel(personnelId);
    setShowForm(true);
  };

  const handleAssign = (personnelId: string) => {
    setSelectedPersonnelId(personnelId);
    setShowAssignmentModal(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPersonnel(null);
  };

  const handleCloseAssignmentModal = () => {
    setShowAssignmentModal(false);
    setSelectedPersonnelId(null);
  };

  const handleExportPersonnel = () => {
    exportToExcel.personnel(filteredPersonnel);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personel Yönetimi</h2>
          <p className="text-gray-600 dark:text-gray-400">Personel ve cihaz zimmetlerini yönetin</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPersonnel}
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
            Personel Ekle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Personel</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{personnel.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Zimmetli Personel</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {personnel.filter(p => p.assignedDevices.length > 0).length}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Departman Sayısı</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{departments.length}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
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
                placeholder="Personel ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
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
          </div>
        </div>
      </div>

      {/* Personnel List */}
      <PersonnelList 
        personnel={filteredPersonnel} 
        onEdit={handleEdit}
        onAssign={handleAssign}
      />

      {/* Personnel Form Modal */}
      {showForm && (
        <PersonnelForm
          personnelId={editingPersonnel}
          onClose={handleCloseForm}
        />
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && selectedPersonnelId && (
        <AssignmentModal
          personnelId={selectedPersonnelId}
          onClose={handleCloseAssignmentModal}
        />
      )}
    </div>
  );
};