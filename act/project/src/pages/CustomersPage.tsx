import React from 'react';
import CustomersList from '../components/CustomersList';
import CustomerForm from '../components/CustomerForm';

const CustomersPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-6">Gestión de Clientes</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CustomerForm />
        </div>
        
        <div className="lg:col-span-2">
          <CustomersList />
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;