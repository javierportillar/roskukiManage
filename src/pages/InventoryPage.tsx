import React from 'react';
import InventoryForm from '../components/InventoryForm';
import InventoryList from '../components/InventoryList';

const InventoryPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-6">Gestión de Inventario</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <InventoryForm />
        </div>
        
        <div className="lg:col-span-2">
          <InventoryList />
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;