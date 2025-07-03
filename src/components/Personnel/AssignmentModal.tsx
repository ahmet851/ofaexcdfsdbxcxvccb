import React, { useState } from 'react';
import { X, Monitor, CheckCircle, ArrowLeft, Calendar, User, Package, FileText } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AssignmentModalProps {
  personnelId: string;
  onClose: () => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({ personnelId, onClose }) => {
  const { personnel, devices, assignments, assignDevice, returnDevice } = useApp();
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'assign' | 'current' | 'history'>('current');

  const person = personnel.find(p => p.id === personnelId);
  const availableDevices = devices.filter(d => d.status === 'available');
  const assignedDevices = devices.filter(d => d.assignedTo === person?.name);
  const activeAssignments = assignments.filter(a => a.personnelId === personnelId && a.status === 'active');
  const allAssignments = assignments.filter(a => a.personnelId === personnelId);

  const formatTurkishDate = (date: Date) => {
    return format(date, 'dd.MM.yyyy HH:mm', { locale: tr });
  };

  if (!person) return null;

  const handleAssignDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeviceId) {
      try {
        await assignDevice(selectedDeviceId, personnelId, notes);
        setSelectedDeviceId('');
        setNotes('');
        setActiveTab('current');
      } catch (error) {
        console.error('Zimmet atama hatası:', error);
        alert('Zimmet atanırken bir hata oluştu');
      }
    }
  };

  const handleReturnDevice = async (assignmentId: string) => {
    if (confirm('Bu cihazı iade etmek istediğinizden emin misiniz?')) {
      try {
        await returnDevice(assignmentId);
      } catch (error) {
        console.error('Zimmet iade hatası:', error);
        alert('Zimmet iade edilirken bir hata oluştu');
      }
    }
  };

  const getDeviceSpecs = (device: any) => {
    const specs = [];
    if (device.specifications?.processor) specs.push(device.specifications.processor);
    if (device.specifications?.ram) specs.push(device.specifications.ram);
    if (device.specifications?.generation) specs.push(device.specifications.generation);
    return specs.join(' • ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cihaz Zimmetleri</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{person.name} • {person.department}</p>
            </div>
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
              onClick={() => setActiveTab('current')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'current'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Mevcut Zimmetler ({assignedDevices.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('assign')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'assign'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Yeni Zimmet
              </div>
            </button>
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
                Zimmet Geçmişi ({allAssignments.length})
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Current Assignments Tab */}
          {activeTab === 'current' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Mevcut Zimmetler ({assignedDevices.length})
              </h3>
              {assignedDevices.length > 0 ? (
                <div className="grid gap-4">
                  {assignedDevices.map(device => {
                    const assignment = activeAssignments.find(a => a.deviceId === device.id);
                    return (
                      <div key={device.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                              <Monitor className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                {device.brand} {device.category}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                Seri: {device.serialNumber}
                              </p>
                              {getDeviceSpecs(device) && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {getDeviceSpecs(device)}
                                </p>
                              )}
                              {assignment && (
                                <div className="mt-3 space-y-1">
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    Zimmet: {formatTurkishDate(assignment.assignedDate)}
                                  </div>
                                  {assignment.notes && (
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <FileText className="h-4 w-4 mt-0.5" />
                                      <span>{assignment.notes}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 text-sm font-semibold rounded-full">
                              <CheckCircle className="h-3 w-3" />
                              Aktif
                            </span>
                            {assignment && (
                              <button
                                onClick={() => handleReturnDevice(assignment.id)}
                                className="px-4 py-2 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm font-medium rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors"
                              >
                                İade Et
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Şu anda zimmetli cihaz yok</p>
                  <p className="text-sm">Yeni zimmet eklemek için "Yeni Zimmet" sekmesini kullanın</p>
                </div>
              )}
            </div>
          )}

          {/* Assign New Device Tab */}
          {activeTab === 'assign' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Yeni Cihaz Zimmetle</h3>
              
              {availableDevices.length > 0 ? (
                <form onSubmit={handleAssignDevice} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Müsait Cihazlar ({availableDevices.length})
                    </label>
                    <div className="grid gap-3 max-h-60 overflow-y-auto">
                      {availableDevices.map(device => (
                        <label
                          key={device.id}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedDeviceId === device.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="device"
                            value={device.id}
                            checked={selectedDeviceId === device.id}
                            onChange={(e) => setSelectedDeviceId(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {device.brand} {device.category}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                {device.serialNumber}
                              </div>
                              {getDeviceSpecs(device) && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  {getDeviceSpecs(device)}
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedDeviceId === device.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Zimmet Notları (İsteğe bağlı)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Zimmet ile ilgili notlar, özel talimatlar..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedDeviceId}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Monitor className="h-5 w-5" />
                    Cihazı Zimmetle
                  </button>
                </form>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Müsait cihaz yok</p>
                  <p className="text-sm">Zimmetlenebilecek cihaz bulunmuyor</p>
                </div>
              )}
            </div>
          )}

          {/* Assignment History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Zimmet Geçmişi ({allAssignments.length})
              </h3>
              {allAssignments.length > 0 ? (
                <div className="space-y-3">
                  {allAssignments
                    .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
                    .map(assignment => {
                      const device = devices.find(d => d.id === assignment.deviceId);
                      return (
                        <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                              <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {device?.brand} {device?.category}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                {device?.serialNumber}
                              </div>
                              {assignment.notes && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {assignment.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatTurkishDate(assignment.assignedDate)}
                              {assignment.returnedDate && (
                                <span> - {formatTurkishDate(assignment.returnedDate)}</span>
                              )}
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              assignment.status === 'active' 
                                ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200'
                                : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
                            }`}>
                              {assignment.status === 'active' ? 'Aktif' : 'İade Edildi'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Zimmet geçmişi yok</p>
                  <p className="text-sm">Henüz hiç zimmet kaydı bulunmuyor</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};