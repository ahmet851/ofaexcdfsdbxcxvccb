import React, { useState, useRef } from 'react';
import { QrCode, Camera, Search, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';

interface ScanResult {
  code: string;
  item?: any;
  found: boolean;
  timestamp: Date;
}

export const BarcodeScanner: React.FC = () => {
  const { inventoryItems, addInventoryItem } = useInventory();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [manualCode, setManualCode] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemData, setNewItemData] = useState({
    itemName: '',
    category: '',
    locationDepartment: '',
    serialNumber: ''
  });

  // Simulated barcode scanning function
  const simulateScan = () => {
    const mockCodes = [
      'INV001234', 'INV002345', 'INV003456', 'INV004567', 'INV005678',
      'NEW001', 'NEW002', 'NEW003' // These won't be found in inventory
    ];
    
    const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)];
    processScanResult(randomCode);
  };

  const processScanResult = (code: string) => {
    const foundItem = inventoryItems.find(item => 
      item.serialNumber === code || item.id === code
    );

    const result: ScanResult = {
      code,
      item: foundItem,
      found: !!foundItem,
      timestamp: new Date()
    };

    setScanResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results

    if (!foundItem) {
      setNewItemData(prev => ({ ...prev, serialNumber: code }));
      setShowAddForm(true);
    }
  };

  const handleManualSearch = () => {
    if (manualCode.trim()) {
      processScanResult(manualCode.trim());
      setManualCode('');
    }
  };

  const handleAddNewItem = async () => {
    if (!newItemData.itemName || !newItemData.category || !newItemData.locationDepartment) {
      alert('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    try {
      await addInventoryItem({
        itemName: newItemData.itemName,
        serialNumber: newItemData.serialNumber,
        category: newItemData.category,
        locationDepartment: newItemData.locationDepartment,
        currentStatus: 'in_stock',
        specifications: {}
      });

      setShowAddForm(false);
      setNewItemData({ itemName: '', category: '', locationDepartment: '', serialNumber: '' });
      
      // Update the scan result to show it's now found
      setScanResults(prev => prev.map(result => 
        result.code === newItemData.serialNumber 
          ? { ...result, found: true, item: { itemName: newItemData.itemName } }
          : result
      ));
    } catch (error) {
      console.error('Yeni öğe ekleme hatası:', error);
      alert('Öğe eklenirken hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Barkod/QR Kod Tarayıcı</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Envanter öğelerini hızlıca bulun veya ekleyin</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsScanning(!isScanning)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isScanning 
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Camera className="h-4 w-4" />
              {isScanning ? 'Taramayı Durdur' : 'Taramayı Başlat'}
            </button>
            <button
              onClick={simulateScan}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <QrCode className="h-4 w-4" />
              Test Tarama
            </button>
          </div>
        </div>

        {/* Camera View Simulation */}
        {isScanning && (
          <div className="mb-6 bg-gray-900 rounded-lg p-8 text-center">
            <div className="border-2 border-dashed border-white/30 rounded-lg p-12">
              <Camera className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70">Kamera görünümü - Barkodu çerçeve içine alın</p>
              <div className="mt-4 w-32 h-32 border-2 border-blue-500 mx-auto rounded-lg animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Manual Input */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
              placeholder="Barkod/seri numarasını manuel girin..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleManualSearch}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            Ara
          </button>
        </div>

        {/* Scan Results */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Tarama Sonuçları ({scanResults.length})
          </h4>
          {scanResults.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {scanResults.map((result, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                  result.found 
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
                }`}>
                  <div className="flex items-center gap-3">
                    {result.found ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {result.code}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {result.found 
                          ? `Bulundu: ${result.item?.itemName || 'Envanter öğesi'}`
                          : 'Envanterde bulunamadı'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {result.timestamp.toLocaleTimeString('tr-TR')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <QrCode className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Henüz tarama yapılmadı</p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Item Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Yeni Öğe Ekle</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seri Numarası
                </label>
                <input
                  type="text"
                  value={newItemData.serialNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Öğe Adı *
                </label>
                <input
                  type="text"
                  value={newItemData.itemName}
                  onChange={(e) => setNewItemData(prev => ({ ...prev, itemName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Öğe adını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori *
                </label>
                <select
                  value={newItemData.category}
                  onChange={(e) => setNewItemData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Kategori Seçin</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Masaüstü">Masaüstü</option>
                  <option value="Monitör">Monitör</option>
                  <option value="Yazıcı">Yazıcı</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Departman *
                </label>
                <select
                  value={newItemData.locationDepartment}
                  onChange={(e) => setNewItemData(prev => ({ ...prev, locationDepartment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Departman Seçin</option>
                  <option value="CRM">CRM</option>
                  <option value="I.T">I.T</option>
                  <option value="Ön Büro">Ön Büro</option>
                  <option value="Yönetim">Yönetim</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddNewItem}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};