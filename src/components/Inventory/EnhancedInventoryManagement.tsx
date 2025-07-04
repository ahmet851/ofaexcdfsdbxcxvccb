import React, { useState } from 'react';
import { Package, AlertTriangle, BarChart3, QrCode, Building, ShoppingCart } from 'lucide-react';
import { InventoryManagement } from './InventoryManagement';
import { StockAlertSystem } from './StockAlertSystem';
import { AutoOrderSystem } from './AutoOrderSystem';
import { AdvancedReporting } from './AdvancedReporting';
import { BarcodeScanner } from './BarcodeScanner';
import { SupplierManagement } from './SupplierManagement';

export const EnhancedInventoryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'alerts' | 'orders' | 'reports' | 'scanner' | 'suppliers'>('inventory');

  const tabs = [
    { id: 'inventory', label: 'Envanter', icon: Package },
    { id: 'alerts', label: 'Uyarılar', icon: AlertTriangle },
    { id: 'orders', label: 'Otomatik Sipariş', icon: ShoppingCart },
    { id: 'reports', label: 'Gelişmiş Raporlar', icon: BarChart3 },
    { id: 'scanner', label: 'Barkod Tarayıcı', icon: QrCode },
    { id: 'suppliers', label: 'Tedarikçiler', icon: Building }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryManagement />;
      case 'alerts':
        return <StockAlertSystem />;
      case 'orders':
        return <AutoOrderSystem />;
      case 'reports':
        return <AdvancedReporting />;
      case 'scanner':
        return <BarcodeScanner />;
      case 'suppliers':
        return <SupplierManagement />;
      default:
        return <InventoryManagement />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gelişmiş Envanter Yönetimi</h2>
        <p className="text-gray-600 dark:text-gray-400">Kapsamlı envanter takibi ve otomasyonu</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};