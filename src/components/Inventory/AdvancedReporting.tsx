import React, { useState, useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Filter } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ReportData {
  categoryDistribution: { category: string; count: number; value: number }[];
  statusDistribution: { status: string; count: number; percentage: number }[];
  departmentDistribution: { department: string; count: number; value: number }[];
  monthlyTrends: { month: string; added: number; disposed: number; maintenance: number }[];
  costAnalysis: { totalValue: number; averageValue: number; categoryValues: Record<string, number> };
  warrantyAnalysis: { expiring: number; expired: number; valid: number };
}

export const AdvancedReporting: React.FC = () => {
  const { inventoryItems, maintenanceRecords } = useInventory();
  const [dateRange, setDateRange] = useState('30');
  const [selectedReport, setSelectedReport] = useState<'overview' | 'financial' | 'maintenance' | 'trends'>('overview');

  const reportData = useMemo((): ReportData => {
    const today = new Date();
    const startDate = dateRange === 'all' ? new Date(0) : subDays(today, parseInt(dateRange));

    // Kategori dağılımı
    const categoryDistribution = inventoryItems.reduce((acc, item) => {
      const existing = acc.find(c => c.category === item.category);
      const value = item.purchasePrice || 0;
      if (existing) {
        existing.count++;
        existing.value += value;
      } else {
        acc.push({ category: item.category, count: 1, value });
      }
      return acc;
    }, [] as { category: string; count: number; value: number }[]);

    // Durum dağılımı
    const statusCounts = inventoryItems.reduce((acc, item) => {
      acc[item.currentStatus] = (acc[item.currentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: (count / inventoryItems.length) * 100
    }));

    // Departman dağılımı
    const departmentDistribution = inventoryItems.reduce((acc, item) => {
      const existing = acc.find(d => d.department === item.locationDepartment);
      const value = item.purchasePrice || 0;
      if (existing) {
        existing.count++;
        existing.value += value;
      } else {
        acc.push({ department: item.locationDepartment, count: 1, value });
      }
      return acc;
    }, [] as { department: string; count: number; value: number }[]);

    // Aylık trendler (son 6 ay)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(today, i));
      const monthEnd = endOfMonth(subMonths(today, i));
      
      const monthItems = inventoryItems.filter(item => 
        item.createdAt >= monthStart && item.createdAt <= monthEnd
      );
      
      const monthMaintenance = maintenanceRecords.filter(record =>
        record.startDate >= monthStart && record.startDate <= monthEnd
      );

      monthlyTrends.push({
        month: format(monthStart, 'MMM yyyy', { locale: tr }),
        added: monthItems.length,
        disposed: monthItems.filter(item => item.currentStatus === 'disposed').length,
        maintenance: monthMaintenance.length
      });
    }

    // Maliyet analizi
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
    const averageValue = totalValue / inventoryItems.length;
    const categoryValues = categoryDistribution.reduce((acc, cat) => {
      acc[cat.category] = cat.value;
      return acc;
    }, {} as Record<string, number>);

    // Garanti analizi
    const warrantyAnalysis = inventoryItems.reduce((acc, item) => {
      if (!item.warrantyEndDate) return acc;
      
      const daysUntilExpiry = Math.ceil((item.warrantyEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        acc.expired++;
      } else if (daysUntilExpiry <= 30) {
        acc.expiring++;
      } else {
        acc.valid++;
      }
      
      return acc;
    }, { expiring: 0, expired: 0, valid: 0 });

    return {
      categoryDistribution,
      statusDistribution,
      departmentDistribution,
      monthlyTrends,
      costAnalysis: { totalValue, averageValue, categoryValues },
      warrantyAnalysis
    };
  }, [inventoryItems, maintenanceRecords, dateRange]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return 'Stokta';
      case 'defective': return 'Arızalı';
      case 'under_repair': return 'Onarımda';
      case 'disposed': return 'İmha Edildi';
      default: return status;
    }
  };

  const exportReport = () => {
    const reportContent = {
      generatedAt: new Date().toISOString(),
      dateRange,
      summary: {
        totalItems: inventoryItems.length,
        totalValue: reportData.costAnalysis.totalValue,
        averageValue: reportData.costAnalysis.averageValue
      },
      ...reportData
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `envanter_raporu_${format(new Date(), 'dd-MM-yyyy')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gelişmiş Raporlama</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Detaylı analiz ve trendler</p>
          </div>
          
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7">Son 7 gün</option>
              <option value="30">Son 30 gün</option>
              <option value="90">Son 3 ay</option>
              <option value="365">Son yıl</option>
              <option value="all">Tüm zamanlar</option>
            </select>
            
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Rapor İndir
            </button>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
              { id: 'financial', label: 'Mali Analiz', icon: TrendingUp },
              { id: 'maintenance', label: 'Bakım Analizi', icon: Calendar },
              { id: 'trends', label: 'Trendler', icon: PieChart }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedReport(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedReport === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Durum Dağılımı</h4>
            <div className="space-y-3">
              {reportData.statusDistribution.map(item => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getStatusText(item.status)}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white w-12">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kategori Dağılımı</h4>
            <div className="space-y-3">
              {reportData.categoryDistribution
                .sort((a, b) => b.count - a.count)
                .slice(0, 8)
                .map(item => (
                  <div key={item.category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ₺{item.value.toLocaleString('tr-TR')}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white w-8">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Financial Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mali Özet</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Değer</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₺{reportData.costAnalysis.totalValue.toLocaleString('tr-TR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ortalama Değer</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  ₺{reportData.costAnalysis.averageValue.toLocaleString('tr-TR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Öğe</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {inventoryItems.length}
                </p>
              </div>
            </div>
          </div>

          {/* Category Values */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kategoriye Göre Değer</h4>
            <div className="space-y-3">
              {Object.entries(reportData.costAnalysis.categoryValues)
                .sort(([,a], [,b]) => b - a)
                .map(([category, value]) => {
                  const percentage = (value / reportData.costAnalysis.totalValue) * 100;
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{category}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white w-20">
                          ₺{value.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'maintenance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Warranty Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Garanti Analizi</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Geçerli Garanti</span>
                <span className="text-lg font-bold text-emerald-600">{reportData.warrantyAnalysis.valid}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Yakında Bitecek</span>
                <span className="text-lg font-bold text-amber-600">{reportData.warrantyAnalysis.expiring}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-sm font-medium text-red-800 dark:text-red-200">Süresi Bitmiş</span>
                <span className="text-lg font-bold text-red-600">{reportData.warrantyAnalysis.expired}</span>
              </div>
            </div>
          </div>

          {/* Maintenance Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bakım Özeti</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Bakım Kaydı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{maintenanceRecords.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Bakım</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {maintenanceRecords.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tamamlanan Bakım</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {maintenanceRecords.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'trends' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aylık Trendler</h4>
          <div className="space-y-4">
            {reportData.monthlyTrends.map(trend => (
              <div key={trend.month} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">{trend.month}</h5>
                  <div className="flex gap-4 text-sm">
                    <span className="text-emerald-600">+{trend.added} eklendi</span>
                    <span className="text-red-600">-{trend.disposed} imha</span>
                    <span className="text-amber-600">{trend.maintenance} bakım</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-emerald-100 dark:bg-emerald-900/20 h-2 rounded" style={{ width: `${(trend.added / 10) * 100}%` }}></div>
                  <div className="bg-red-100 dark:bg-red-900/20 h-2 rounded" style={{ width: `${(trend.disposed / 5) * 100}%` }}></div>
                  <div className="bg-amber-100 dark:bg-amber-900/20 h-2 rounded" style={{ width: `${(trend.maintenance / 15) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};