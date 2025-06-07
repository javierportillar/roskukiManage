import React from 'react';
import OrdersList from '../components/OrdersList';

const OrdersPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-6">Gestión de Pedidos</h1>
      
      <div className="space-y-6">
        <OrdersList />
      </div>
    </div>
  );
};

export default OrdersPage;