import React from 'react';
import { Sun, Moon, User, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { loading, error } = useApp();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            IT Zimmet Yönetim Sistemi
          </h2>
          <div className={`flex items-center gap-2 px-3 py-1 text-sm rounded-full ${
            error 
              ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
          }`}>
            {error ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
            {error ? 'Bağlantı Hatası' : 'Canlı Sistem'}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={`${theme === 'light' ? 'Koyu' : 'Açık'} temaya geç`}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <div className="h-6 border-l border-gray-200 dark:border-gray-700"></div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Yönetici</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sistem Yöneticisi</p>
            </div>
            <div className="relative">
              <button className="flex items-center gap-2 p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="mt-2">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </header>
  );
};