import React from 'react';
import { Edit, Trash2, Package, CheckCircle, AlertTriangle, Wrench, Clock, Calendar, DollarSign, MapPin } from 'lucide-react';
import { InventoryItem, useInventory } from '../../contexts/InventoryContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface InventoryListProps {
  items: InventoryItem[];
  onEdit: (itemId: string) => void;
  onMaintenance: (itemId: string) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ items, onEdit, onMaintenance }) => {
  const { deleteInventoryItem, markAsDefective, markAsRepaired } = useInventory();

  const formatTurkishDate = (date: any) => {
    if (!date) return '-';
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return '-';
    return format(parsedDate, 'dd.MM.yyyy', { locale: tr });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'defective':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'under_repair':
        return <Wrench className="h-4 w-4 text-amber-500" />;
      case 'disposed':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return 'Stokta';
      case 'defective': return 'Arızalı';
      case 'under_repair': return 'Onarımda';
      case 'disposed': return 'İmha Edildi';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200';
      case 'defective':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'under_repair':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200';
      case 'disposed':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  const isWarrantyExpiring = (warrantyEndDate?: Date) => {
    if (!warrantyEndDate) return false;
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return warrantyEndDate <= thirtyDaysFromNow && warrantyEndDate >= today;
  };

  const isWarrantyExpired = (warrantyEndDate?: Date) => {
    if (!warrantyEndDate) return false;
    return warrantyEndDate < new Date();
  };

  const handleMarkDefective = async (item: InventoryItem) => {
    const reason = prompt('Arıza sebebini belirtin:');
    if (reason) {
      try {
        await markAsDefective(item.id, reason);
      } catch (error) {
        alert('Arızalı işaretleme sırasında hata oluştu');
      }
    }
  };

  const handleMarkRepaired = async (item: InventoryItem) => {
    if (confirm('Bu öğe onarıldı olarak işaretlensin mi?')) {
      try {
        await markAsRepaired(item.id);
      } catch (error) {
        alert('Onarım işaretleme sırasında hata oluştu');
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Envanter öğesi bulunamadı</h3>
        <p className="text-gray-500 dark:text-gray-400">Arama veya filtre kriterlerinizi ayarlayın.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.itemName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{item.serialNumber}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(item.id)}
                className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Düzenle"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteInventoryItem(item.id)}
                className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(item.currentStatus)}
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.currentStatus)}`}>
                  {getStatusText(item.currentStatus)}
                </span>
              </div>
              {item.warrantyEndDate && (
                <div className="flex items-center gap-1 text-xs">
                  {isWarrantyExpired(item.warrantyEndDate) ? (
                    <span className="text-red-600 dark:text-red-400">Garanti Bitti</span>
                  ) : isWarrantyExpiring(item.warrantyEndDate) ? (
                    <span className="text-amber-600 dark:text-amber-400">Garanti Bitiyor</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">Garantili</span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{item.locationDepartment}</span>
              </div>
            </div>

            {item.brand && item.model && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{item.brand}</strong> {item.model}
              </div>
            )}

            {item.purchaseDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Satın Alım: {formatTurkishDate(item.purchaseDate)}</span>
              </div>
            )}

            {item.purchasePrice && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <DollarSign className="h-4 w-4" />
                <span>₺{item.purchasePrice.toLocaleString('tr-TR')}</span>
              </div>
            )}

            {item.warrantyEndDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Garanti: {formatTurkishDate(item.warrantyEndDate)}</span>
              </div>
            )}

            {item.notes && (
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                {item.notes}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <button
              onClick={() => onMaintenance(item.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors text-sm"
            >
              <Wrench className="h-4 w-4" />
              Bakım
            </button>
            
            {item.currentStatus === 'in_stock' && (
              <button
                onClick={() => handleMarkDefective(item)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-sm"
              >
                <AlertTriangle className="h-4 w-4" />
                Arızalı
              </button>
            )}
            
            {(item.currentStatus === 'defective' || item.currentStatus === 'under_repair') && (
              <button
                onClick={() => handleMarkRepaired(item)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-sm"
              >
                <CheckCircle className="h-4 w-4" />
                Onarıldı
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};