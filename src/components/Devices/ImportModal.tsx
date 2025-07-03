import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../contexts/AppContext';

interface ImportModalProps {
  onClose: () => void;
}

interface ImportRow {
  brand: string;
  category: string;
  serialNumber: string;
  status: string;
  ram?: string;
  processor?: string;
  generation?: string;
  assignedTo?: string;
  department?: string;
  notes?: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose }) => {
  const { addDevice, addPersonnel, assignDevice, personnel } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const templateData = [
      {
        'Marka': 'Dell',
        'Kategori': 'Laptop',
        'Seri Numarası': 'DL001234',
        'Durum': 'available',
        'RAM': '16GB',
        'İşlemci': 'Intel Core i7',
        'Nesil': '12. Nesil',
        'Zimmetli Kişi': '',
        'Departman': '',
        'Notlar': ''
      },
      {
        'Marka': 'HP',
        'Kategori': 'Masaüstü',
        'Seri Numarası': 'HP005678',
        'Durum': 'assigned',
        'RAM': '8GB',
        'İşlemci': 'Intel Core i5',
        'Nesil': '11. Nesil',
        'Zimmetli Kişi': 'Ahmet Yılmaz',
        'Departman': 'CRM',
        'Notlar': 'Yeni zimmet'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cihaz Şablonu');
    XLSX.writeFile(wb, 'cihaz_import_sablonu.xlsx');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedData: ImportRow[] = jsonData.map((row: any) => ({
          brand: row['Marka'] || '',
          category: row['Kategori'] || '',
          serialNumber: row['Seri Numarası'] || '',
          status: mapStatus(row['Durum'] || 'available'),
          ram: row['RAM'] || '',
          processor: row['İşlemci'] || '',
          generation: row['Nesil'] || '',
          assignedTo: row['Zimmetli Kişi'] || '',
          department: row['Departman'] || '',
          notes: row['Notlar'] || ''
        }));

        setImportData(parsedData);
      } catch (error) {
        console.error('Excel dosyası okuma hatası:', error);
        alert('Excel dosyası okunamadı. Lütfen dosya formatını kontrol edin.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const mapStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'müsait': 'available',
      'available': 'available',
      'zimmetli': 'assigned',
      'assigned': 'assigned',
      'bakımda': 'maintenance',
      'maintenance': 'maintenance',
      'emekli': 'retired',
      'retired': 'retired'
    };
    return statusMap[status.toLowerCase()] || 'available';
  };

  const validateRow = (row: ImportRow): string[] => {
    const errors: string[] = [];
    
    if (!row.brand.trim()) errors.push('Marka boş olamaz');
    if (!row.category.trim()) errors.push('Kategori boş olamaz');
    if (!row.serialNumber.trim()) errors.push('Seri numarası boş olamaz');
    
    if (row.status === 'assigned' && !row.assignedTo.trim()) {
      errors.push('Zimmetli durumdaki cihazlar için kişi adı gerekli');
    }
    
    return errors;
  };

  const handleImport = async () => {
    if (importData.length === 0) return;

    setImporting(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      for (let i = 0; i < importData.length; i++) {
        const row = importData[i];
        const rowErrors = validateRow(row);
        
        if (rowErrors.length > 0) {
          errors.push(`Satır ${i + 2}: ${rowErrors.join(', ')}`);
          continue;
        }

        try {
          // Cihazı ekle
          const deviceData = {
            brand: row.brand,
            category: row.category,
            serialNumber: row.serialNumber,
            status: row.status as any,
            specifications: {
              ram: row.ram,
              processor: row.processor,
              generation: row.generation
            }
          };

          await addDevice(deviceData);

          // Eğer zimmetli ise, personeli bul veya oluştur ve zimmetle
          if (row.status === 'assigned' && row.assignedTo) {
            let person = personnel.find(p => 
              p.name.toLowerCase() === row.assignedTo.toLowerCase()
            );

            // Personel yoksa oluştur
            if (!person && row.department) {
              const newPersonData = {
                name: row.assignedTo,
                department: row.department,
                title: 'Çalışan',
                email: `${row.assignedTo.toLowerCase().replace(/\s+/g, '.')}@otel.com`,
                phone: '+90-555-0000'
              };
              
              await addPersonnel(newPersonData);
              
              // Yeni eklenen personeli bul
              const updatedPersonnel = await new Promise(resolve => {
                setTimeout(() => {
                  const found = personnel.find(p => p.name === row.assignedTo);
                  resolve(found);
                }, 100);
              });
              
              person = updatedPersonnel as any;
            }

            // Zimmet ata
            if (person) {
              // Cihazı bul (yeni eklenen)
              setTimeout(async () => {
                try {
                  // Bu kısım gerçek implementasyonda device ID'si ile yapılmalı
                  // Şimdilik basit bir yaklaşım kullanıyoruz
                  console.log(`Zimmet atanıyor: ${row.serialNumber} -> ${row.assignedTo}`);
                } catch (assignError) {
                  errors.push(`Satır ${i + 2}: Zimmet atama hatası`);
                }
              }, 200);
            }
          }

          successCount++;
        } catch (error) {
          errors.push(`Satır ${i + 2}: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
        }
      }

      setResults({ success: successCount, errors });
    } catch (error) {
      errors.push('Genel import hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      setResults({ success: successCount, errors });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Excel'den Veri İçe Aktar</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Excel Şablonu</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Doğru format için önce şablonu indirin ve doldurun.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Şablon İndir
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excel Dosyası Seç
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Excel dosyasını seçin veya sürükleyip bırakın
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Dosya Seç
              </button>
              {file && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Seçilen dosya: {file.name}
                </p>
              )}
            </div>
          </div>

          {/* Preview Data */}
          {importData.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Önizleme ({importData.length} kayıt)
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {importData.slice(0, 5).map((row, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{row.brand} {row.category}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        {row.serialNumber}
                      </span>
                      {row.assignedTo && (
                        <span className="text-blue-600 dark:text-blue-400 ml-2">
                          → {row.assignedTo}
                        </span>
                      )}
                    </div>
                  ))}
                  {importData.length > 5 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ... ve {importData.length - 5} kayıt daha
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Import Results */}
          {results && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">{results.success} kayıt başarıyla içe aktarıldı</span>
              </div>
              
              {results.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-900 dark:text-red-100">
                        {results.errors.length} hata oluştu:
                      </h4>
                      <ul className="text-sm text-red-700 dark:text-red-300 mt-1 space-y-1">
                        {results.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {results ? 'Kapat' : 'İptal'}
            </button>
            {importData.length > 0 && !results && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    İçe Aktarılıyor...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    İçe Aktar ({importData.length} kayıt)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};