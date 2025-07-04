import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Edit, Trash2, Send, Clock, CheckCircle } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';

interface AutoOrderRule {
  id: string;
  category: string;
  supplier: string;
  minThreshold: number;
  orderQuantity: number;
  isActive: boolean;
  lastOrderDate?: Date;
  nextOrderDate?: Date;
}

interface PendingOrder {
  id: string;
  ruleId: string;
  category: string;
  supplier: string;
  quantity: number;
  estimatedCost: number;
  status: 'pending' | 'approved' | 'ordered' | 'received';
  createdAt: Date;
  notes?: string;
}

export const AutoOrderSystem: React.FC = () => {
  const { inventoryItems, categories } = useInventory();
  const [autoOrderRules, setAutoOrderRules] = useState<AutoOrderRule[]>([
    {
      id: '1',
      category: 'Laptop',
      supplier: 'TechnoSA',
      minThreshold: 5,
      orderQuantity: 10,
      isActive: true
    },
    {
      id: '2',
      category: 'Monitör',
      supplier: 'Vatan Bilgisayar',
      minThreshold: 8,
      orderQuantity: 15,
      isActive: true
    }
  ]);
  
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({
    category: '',
    supplier: '',
    minThreshold: 5,
    orderQuantity: 10
  });

  useEffect(() => {
    checkAutoOrderTriggers();
  }, [inventoryItems, autoOrderRules]);

  const checkAutoOrderTriggers = () => {
    const categoryStock = inventoryItems.reduce((acc, item) => {
      if (item.currentStatus === 'in_stock') {
        acc[item.category] = (acc[item.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    autoOrderRules.forEach(rule => {
      if (!rule.isActive) return;
      
      const currentStock = categoryStock[rule.category] || 0;
      if (currentStock <= rule.minThreshold) {
        // Check if there's already a pending order for this rule
        const existingOrder = pendingOrders.find(order => 
          order.ruleId === rule.id && order.status === 'pending'
        );
        
        if (!existingOrder) {
          createAutoOrder(rule, currentStock);
        }
      }
    });
  };

  const createAutoOrder = (rule: AutoOrderRule, currentStock: number) => {
    const newOrder: PendingOrder = {
      id: Date.now().toString(),
      ruleId: rule.id,
      category: rule.category,
      supplier: rule.supplier,
      quantity: rule.orderQuantity,
      estimatedCost: rule.orderQuantity * 1500, // Örnek fiyat
      status: 'pending',
      createdAt: new Date(),
      notes: `Otomatik sipariş - Mevcut stok: ${currentStock}, Minimum: ${rule.minThreshold}`
    };

    setPendingOrders(prev => [...prev, newOrder]);
  };

  const addAutoOrderRule = () => {
    if (!newRule.category || !newRule.supplier) return;

    const rule: AutoOrderRule = {
      id: Date.now().toString(),
      ...newRule,
      isActive: true
    };

    setAutoOrderRules(prev => [...prev, rule]);
    setNewRule({ category: '', supplier: '', minThreshold: 5, orderQuantity: 10 });
    setShowAddRule(false);
  };

  const toggleRuleStatus = (ruleId: string) => {
    setAutoOrderRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    if (confirm('Bu otomatik sipariş kuralını silmek istediğinizden emin misiniz?')) {
      setAutoOrderRules(prev => prev.filter(rule => rule.id !== ruleId));
    }
  };

  const approveOrder = (orderId: string) => {
    setPendingOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: 'approved' } : order
    ));
  };

  const rejectOrder = (orderId: string) => {
    setPendingOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200';
      case 'approved': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      case 'ordered': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200';
      case 'received': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Onay Bekliyor';
      case 'approved': return 'Onaylandı';
      case 'ordered': return 'Sipariş Verildi';
      case 'received': return 'Teslim Alındı';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Bekleyen Siparişler ({pendingOrders.filter(o => o.status === 'pending').length})
        </h3>

        {pendingOrders.length > 0 ? (
          <div className="space-y-3">
            {pendingOrders.map(order => (
              <div key={order.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {order.category} - {order.quantity} adet
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Tedarikçi:</span> {order.supplier}
                      </div>
                      <div>
                        <span className="font-medium">Tahmini Maliyet:</span> ₺{order.estimatedCost.toLocaleString('tr-TR')}
                      </div>
                      <div>
                        <span className="font-medium">Tarih:</span> {order.createdAt.toLocaleDateString('tr-TR')}
                      </div>
                      <div>
                        <span className="font-medium">Durum:</span> {getStatusText(order.status)}
                      </div>
                    </div>
                    {order.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{order.notes}</p>
                    )}
                  </div>
                  
                  {order.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => approveOrder(order.id)}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => rejectOrder(order.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Bekleyen sipariş bulunmuyor</p>
          </div>
        )}
      </div>

      {/* Auto Order Rules */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Otomatik Sipariş Kuralları ({autoOrderRules.length})
          </h3>
          <button
            onClick={() => setShowAddRule(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Kural Ekle
          </button>
        </div>

        {/* Add Rule Form */}
        {showAddRule && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Yeni Otomatik Sipariş Kuralı</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={newRule.category}
                onChange={(e) => setNewRule(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Kategori Seçin</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Tedarikçi"
                value={newRule.supplier}
                onChange={(e) => setNewRule(prev => ({ ...prev, supplier: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Min. Stok"
                value={newRule.minThreshold}
                onChange={(e) => setNewRule(prev => ({ ...prev, minThreshold: parseInt(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Sipariş Miktarı"
                value={newRule.orderQuantity}
                onChange={(e) => setNewRule(prev => ({ ...prev, orderQuantity: parseInt(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={addAutoOrderRule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ekle
              </button>
              <button
                onClick={() => setShowAddRule(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Rules List */}
        <div className="space-y-3">
          {autoOrderRules.map(rule => (
            <div key={rule.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{rule.category}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      rule.isActive 
                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200'
                        : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
                    }`}>
                      {rule.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Tedarikçi:</span> {rule.supplier}
                    </div>
                    <div>
                      <span className="font-medium">Min. Stok:</span> {rule.minThreshold}
                    </div>
                    <div>
                      <span className="font-medium">Sipariş Miktarı:</span> {rule.orderQuantity}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleRuleStatus(rule.id)}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      rule.isActive
                        ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/40'
                        : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900/40'
                    }`}
                  >
                    {rule.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};