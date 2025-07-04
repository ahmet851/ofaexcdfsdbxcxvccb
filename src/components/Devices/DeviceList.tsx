import React from 'react';
import { Edit, Trash2, Monitor, CheckCircle, AlertTriangle, Clock, XCircle, HardDrive } from 'lucide-react';
import { Device, useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DeviceListProps {
  devices: Device[];
  onEdit: (deviceId: string) => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices, onEdit }) => {
  const { deleteDevice } = useApp();

const formatTurkishDate = (date: any) => {
  if (!date) return '-';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return '-';
  return format(parsedDate, 'dd.MM.yyyy', { locale: tr });
};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'assigned':
        return <Monitor className="h-4 w-4 text-blue-500" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'retired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200';
      case 'assigned':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      case 'maintenance':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200';
      case 'retired':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  const getStorageInfo = (device: Device) => {
    const { storageType, storageCapacity } = device.specifications;
    if (storageType && storageCapacity) {
      return `${storageType} ${storageCapacity}`;
    }
    if (storageType) return storageType;
    if (storageCapacity) return storageCapacity;
    return '-';
  };

  if (devices.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Cihaz bulunamadı</h3>
        <p className="text-gray-500 dark:text-gray-400">Arama veya filtre kriterlerinizi ayarlayın.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cihaz
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Seri Numarası
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Zimmetli Kişi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Özellikler
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Depolama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ekleme Tarihi
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {devices.map((device) => (
              <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3">
                      <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.brand}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {device.category}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900 dark:text-white">
                    {device.serialNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(device.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(device.status)}`}>
                      {getStatusText(device.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {device.assignedTo || '-'}
                  </div>
                  {device.assignedDate && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTurkishDate(device.assignedDate)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {device.specifications.processor && (
                      <div>{device.specifications.processor}</div>
                    )}
                    {device.specifications.ram && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {device.specifications.ram} RAM
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                    <HardDrive className="h-4 w-4 text-gray-400" />
                    <span>{getStorageInfo(device)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatTurkishDate(device.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(device.id)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Cihazı düzenle"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteDevice(device.id)}
                      className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Cihazı sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};