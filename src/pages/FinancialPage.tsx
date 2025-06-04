import React from 'react';
import FinancialForm from '../components/FinancialForm';
import FinancialReport from '../components/FinancialReport';

const FinancialPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-6">Gestión Financiera</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FinancialForm />
        </div>
        
        <div className="lg:col-span-2">
          <FinancialReport />
        </div>
      </div>
    </div>
  );
};

export default FinancialPage;