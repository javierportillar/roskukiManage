import React, { useState } from 'react';
import InventoryForm from '../components/InventoryForm';
import InventoryList from '../components/InventoryList';
import InventoryMovements from '../components/InventoryMovements';
import { Package, History } from 'lucide-react';

const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'management' | 'movements'>('management');

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-6">Gestión de Inventario</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('management')}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'management'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
        >
          <Package className="h-5 w-5 mr-2" />
          Gestión de Inventario
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'movements'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
        >
          <History className="h-5 w-5 mr-2" />
          Movimientos de Inventario
        </button>
      </div>
      
      {activeTab === 'management' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <InventoryForm />
          </div>
          
          <div className="lg:col-span-2">
            <InventoryList />
          </div>
        </div>
      ) : (
        <InventoryMovements />
      )}
    </div>
  );
};

export default InventoryPage;