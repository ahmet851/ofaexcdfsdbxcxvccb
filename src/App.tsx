import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { DeviceManagement } from './components/Devices/DeviceManagement';
import { PersonnelManagement } from './components/Personnel/PersonnelManagement';
import { Reports } from './components/Reports/Reports';
import { Settings } from './components/Settings/Settings';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'devices':
        return <DeviceManagement />;
      case 'personnel':
        return <PersonnelManagement />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <AppProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            isCollapsed={sidebarCollapsed}
            setIsCollapsed={setSidebarCollapsed}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-auto">
              {renderContent()}
            </main>
          </div>
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;