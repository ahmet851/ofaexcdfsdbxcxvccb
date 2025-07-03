import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter, Users, Monitor, TrendingUp } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { exportToExcel, exportToJSON } from '../../lib/exportUtils';

export const Reports: React.FC = () => {
  const { devices, personnel, assignments } = useApp();
  const [reportType, setReportType] = useState('combined');
  const [dateRange, setDateRange] = useState('30');
  const [department, setDepartment] = useState('');

  const formatTurkishDate = (date: Date) => {
    return format(date, 'dd.MM.yyyy', { locale: tr });
  };

  const handleExportExcel = () => {
    switch (reportType) {
      case 'devices':
        exportToExcel.devices(devices);
        break;
      case 'personnel':
        exportToExcel.personnel(personnel);
        break;
      case 'assignments':
        exportToExcel.assignments(assignments, devices, personnel);
        break;
      default:
        exportToExcel.combined(devices, personnel, assignments);
    }
  };

  const handleExportJSON = () => {
    exportToJSON.all(devices, personnel, assignments);
  };

  const stats = {
    totalDevices: devices.length,
    totalPersonnel: personnel.length,
    totalAssignments: assignments.length,
    activeAssignments: assignments.filter(a => a.status === 'active').length,
    devicesByCategory: devices.reduce((acc, device) => {
      acc[device.category] = (acc[device.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    devicesByStatus: devices.reduce((acc, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    personnelByDepartment: personnel.reduce((acc, person) => {
      acc[person.department] = (acc[person.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Müsait';
      case 'assigned': return 'Zimmetli';
      case 'maintenance': return 'Bakımda';
      case 'retired': return 'Emekli';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Raporlar ve Analitik</h2>
          <p className="text-gray-600 dark:text-gray-400">Detaylı raporlar oluşturun ve dışa aktarın</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Rapor</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">24</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">İzlenen Cihaz</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalDevices}</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Monitor className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Personel</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPersonnel}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Zimmet</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeAssignments}</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Generator */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rapor Oluştur</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rapor Türü
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="combined">Birleşik Rapor (Tüm Veriler)</option>
                <option value="devices">Sadece Cihazlar</option>
                <option value="personnel">Sadece Personel</option>
                <option value="assignments">Zimmet Geçmişi</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarih Aralığı
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7">Son 7 gün</option>
                  <option value="30">Son 30 g</option>
                  <option value="90">Son 3 ay</option>
                  <option value="365">Son yıl</option>
                  <option value="all">Tüm zamanlar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Departman
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tüm Departmanlar</option>
                  <option value="CRM">CRM</option>
                  <option value="Animasyon">Animasyon</option>
                  <option value="Ses/Görüntü">Ses/Görüntü</option>
                  <option value="Aydınlatma">Aydınlatma</option>
                  <option value="Mutfak">Mutfak</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                Excel'e Aktar
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                JSON Yedek
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hızlı İstatistikler</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Duruma Göre Cihazlar</h4>
              <div className="space-y-2">
                {Object.entries(stats.devicesByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{getStatusText(status)}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">En Çok Kullanılan Kategoriler</h4>
              <div className="space-y-2">
                {Object.entries(stats.devicesByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{category}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Departmana Göre Personel</h4>
              <div className="space-y-2">
                {Object.entries(stats.personnelByDepartment).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{dept}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Son Aktiviteler</h3>
        <div className="space-y-3">
          {assignments
            .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
            .slice(0, 10)
            .map(assignment => {
              const device = devices.find(d => d.id === assignment.deviceId);
              const person = personnel.find(p => p.id === assignment.personnelId);
              return (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {device?.brand} {device?.category} - {person?.name}'e zimmetlendi
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {person?.department} • {formatTurkishDate(assignment.assignedDate)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    assignment.status === 'active'
                      ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200'
                      : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
                  }`}>
                    {assignment.status === 'active' ? 'Aktif' : 'İade Edildi'}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};