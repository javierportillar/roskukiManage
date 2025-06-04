import React, { useState } from 'react';
import UserSelector from '../components/UserSelector';
import CookieSelector from '../components/CookieSelector';
import CurrentSale from '../components/CurrentSale';
import SalesHistory from '../components/SalesHistory';
import { ShoppingCart, History } from 'lucide-react';

const SalesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-6">Gestión de Ventas</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'current'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Venta Actual
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
        >
          <History className="h-5 w-5 mr-2" />
          Historial
        </button>
      </div>
      
      {activeTab === 'current' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <UserSelector />
            <CookieSelector />
          </div>
          
          <div className="lg:col-span-2">
            <CurrentSale />
          </div>
        </div>
      ) : (
        <SalesHistory />
      )}
    </div>
  );
};

export default SalesPage;