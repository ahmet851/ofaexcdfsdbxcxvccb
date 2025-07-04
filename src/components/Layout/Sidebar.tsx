import React from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  Users, 
  Package,
  FileText, 
  Settings, 
  ChevronLeft,
  Plus,
  Search,
  Bell
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Ana Panel', icon: LayoutDashboard },
  { id: 'devices', label: 'Cihaz Yönetimi', icon: Monitor },
  { id: 'personnel', label: 'Personel', icon: Users },
  { id: 'inventory', label: 'Envanter Yönetimi', icon: Package },
  { id: 'reports', label: 'Raporlar', icon: FileText },
  { id: 'settings', label: 'Ayarlar', icon: Settings }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  isCollapsed, 
  setIsCollapsed 
}) => {
  return (
    <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Zimmet Yöneticisi
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Otel IT Sistemi</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className={`h-5 w-5 text-gray-500 transition-transform ${
              isCollapsed ? 'rotate-180' : ''
            }`} />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 p-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
              <Plus className="h-4 w-4" />
              Cihaz Ekle
            </button>
            <button className="flex items-center justify-center gap-2 p-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Search className="h-4 w-4" />
              Ara
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Notifications */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                3 cihaz bakım zamanı geldi
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Bakım programını kontrol edin
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};