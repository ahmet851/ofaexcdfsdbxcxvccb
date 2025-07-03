import React from 'react';
import { Monitor, Users, Activity, AlertTriangle, TrendingUp, CheckCircle, Download } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { exportToExcel, exportToJSON } from '../../lib/exportUtils';

export const Dashboard: React.FC = () => {
  const { devices, personnel, assignments } = useApp();

  const stats = {
    totalDevices: devices.length,
    assignedDevices: devices.filter(d => d.status === 'assigned').length,
    availableDevices: devices.filter(d => d.status === 'available').length,
    maintenanceDevices: devices.filter(d => d.status === 'maintenance').length,
    activeAssignments: assignments.filter(a => a.status === 'active').length,
    totalPersonnel: personnel.length
  };

  const devicesByCategory = devices.reduce((acc, device) => {
    acc[device.category] = (acc[device.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentAssignments = assignments
    .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
    .slice(0, 5);

  const formatTurkishDate = (date: Date) => {
    return format(date, 'dd.MM.yyyy', { locale: tr });
  };

  const handleExportAll = () => {
    exportToExcel.combined(devices, personnel, assignments);
  };

  const handleExportJSON = () => {
    exportToJSON.all(devices, personnel, assignments);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Export Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ana Panel</h2>
          <p className="text-gray-600 dark:text-gray-400">Sistem durumu ve son aktiviteler</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Excel Yedek
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            JSON Yedek
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Cihaz</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalDevices}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Monitor className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
            <span className="text-emerald-600 dark:text-emerald-400">Geçen aydan %12 artış</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Zimmetli Cihaz</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.assignedDevices}</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Toplam cihazların %{Math.round((stats.assignedDevices / stats.totalDevices) * 100)}'si
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Zimmet</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeAssignments}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">{personnel.length} personel arasında</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bakım Gerekli</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.maintenanceDevices}</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-amber-600 dark:text-amber-400">Dikkat gerekiyor</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Status Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cihaz Durumu Özeti</h3>
          <div className="space-y-4">
            {[
              { label: 'Müsait', count: stats.availableDevices, color: 'bg-emerald-500', percentage: (stats.availableDevices / stats.totalDevices) * 100 },
              { label: 'Zimmetli', count: stats.assignedDevices, color: 'bg-blue-500', percentage: (stats.assignedDevices / stats.totalDevices) * 100 },
              { label: 'Bakımda', count: stats.maintenanceDevices, color: 'bg-amber-500', percentage: (stats.maintenanceDevices / stats.totalDevices) * 100 }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`${item.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-8">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Son Zimmetler</h3>
          <div className="space-y-4">
            {recentAssignments.length > 0 ? recentAssignments.map((assignment) => {
              const device = devices.find(d => d.id === assignment.deviceId);
              const person = personnel.find(p => p.id === assignment.personnelId);
              
              return (
                <div key={assignment.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {device?.brand} {device?.category} - {person?.name}'e zimmetlendi
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTurkishDate(assignment.assignedDate)} • {person?.department}
                    </p>
                  </div>
                  <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 text-xs rounded-full">
                    Aktif
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Henüz zimmet kaydı yok</p>
            )}
          </div>
        </div>
      </div>

      {/* Device Categories */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kategoriye Göre Cihazlar</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(devicesByCategory).map(([category, count]) => (
            <div key={category} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};