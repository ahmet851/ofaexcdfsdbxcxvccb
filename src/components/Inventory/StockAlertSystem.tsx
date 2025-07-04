import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Settings, X, Save } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';

interface StockAlert {
  id: string;
  itemId: string;
  alertType: 'low_stock' | 'warranty_expiring' | 'maintenance_due';
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: Date;
  acknowledged: boolean;
}

interface StockThreshold {
  category: string;
  minQuantity: number;
  warningDays: number; // Garanti bitimine kaç gün kala uyarı
}

export const StockAlertSystem: React.FC = () => {
  const { inventoryItems } = useInventory();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [thresholds, setThresholds] = useState<StockThreshold[]>([
    { category: 'Laptop', minQuantity: 5, warningDays: 30 },
    { category: 'Masaüstü', minQuantity: 3, warningDays: 30 },
    { category: 'Monitör', minQuantity: 10, warningDays: 60 },
    { category: 'Yazıcı', minQuantity: 2, warningDays: 90 }
  ]);

  useEffect(() => {
    generateAlerts();
  }, [inventoryItems, thresholds]);

  const generateAlerts = () => {
    const newAlerts: StockAlert[] = [];
    const today = new Date();

    // Kategori bazında stok kontrolü
    const categoryStock = inventoryItems.reduce((acc, item) => {
      if (item.currentStatus === 'in_stock') {
        acc[item.category] = (acc[item.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Düşük stok uyarıları
    thresholds.forEach(threshold => {
      const currentStock = categoryStock[threshold.category] || 0;
      if (currentStock < threshold.minQuantity) {
        newAlerts.push({
          id: `low-stock-${threshold.category}`,
          itemId: '',
          alertType: 'low_stock',
          message: `${threshold.category} kategorisinde stok azaldı (${currentStock}/${threshold.minQuantity})`,
          severity: currentStock === 0 ? 'high' : currentStock < threshold.minQuantity / 2 ? 'medium' : 'low',
          createdAt: today,
          acknowledged: false
        });
      }
    });

    // Garanti bitiş uyarıları
    inventoryItems.forEach(item => {
      if (item.warrantyEndDate) {
        const daysUntilExpiry = Math.ceil((item.warrantyEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const threshold = thresholds.find(t => t.category === item.category);
        const warningDays = threshold?.warningDays || 30;

        if (daysUntilExpiry <= warningDays && daysUntilExpiry > 0) {
          newAlerts.push({
            id: `warranty-${item.id}`,
            itemId: item.id,
            alertType: 'warranty_expiring',
            message: `${item.itemName} garantisi ${daysUntilExpiry} gün içinde bitiyor`,
            severity: daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 15 ? 'medium' : 'low',
            createdAt: today,
            acknowledged: false
          });
        }
      }
    });

    setAlerts(newAlerts);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const updateThreshold = (category: string, field: keyof StockThreshold, value: number) => {
    setThresholds(prev => prev.map(threshold =>
      threshold.category === category ? { ...threshold, [field]: value } : threshold
    ));
  };

  const activeAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="space-y-4">
      {/* Alert Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sistem Uyarıları ({activeAlerts.length})
            </h3>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Ayarlar
          </button>
        </div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 ? (
          <div className="space-y-2">
            {activeAlerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs opacity-75">
                        {alert.createdAt.toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Onayla
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Aktif uyarı bulunmuyor</p>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Uyarı Ayarları</h4>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kategori bazında minimum stok seviyeleri ve garanti uyarı sürelerini ayarlayın.
            </p>
            
            <div className="grid gap-4">
              {thresholds.map(threshold => (
                <div key={threshold.category} className="grid grid-cols-3 gap-4 items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {threshold.category}
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Min. Stok
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={threshold.minQuantity}
                      onChange={(e) => updateThreshold(threshold.category, 'minQuantity', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Garanti Uyarı (gün)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={threshold.warningDays}
                      onChange={(e) => updateThreshold(threshold.category, 'warningDays', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                generateAlerts();
                setShowSettings(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Ayarları Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};