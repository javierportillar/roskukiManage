import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart3, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';

type PeriodFilter = 'all' | 'today' | 'week' | 'month';
type TypeFilter = 'all' | 'income' | 'expense';

const FinancialReport: React.FC = () => {
  const { financialRecords } = useAppContext();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  
  const filterByPeriod = (date: Date, filter: PeriodFilter): boolean => {
    const recordDate = new Date(date);
    const today = new Date();
    
    switch (filter) {
      case 'today':
        return (
          recordDate.getDate() === today.getDate() &&
          recordDate.getMonth() === today.getMonth() &&
          recordDate.getFullYear() === today.getFullYear()
        );
      case 'week':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        return recordDate >= oneWeekAgo;
      case 'month':
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        return recordDate >= oneMonthAgo;
      default:
        return true;
    }
  };
  
  const filteredRecords = financialRecords
    .filter(record => typeFilter === 'all' || record.type === typeFilter)
    .filter(record => filterByPeriod(record.date, periodFilter))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalIncome = filteredRecords
    .filter(record => record.type === 'income')
    .reduce((sum, record) => sum + record.amount, 0);
  
  const totalExpense = filteredRecords
    .filter(record => record.type === 'expense')
    .reduce((sum, record) => sum + record.amount, 0);
  
  const balance = totalIncome - totalExpense;
  
  // Group by category for chart
  const categorySums = filteredRecords.reduce((acc, record) => {
    const key = `${record.type}-${record.category}`;
    if (!acc[key]) {
      acc[key] = {
        type: record.type,
        category: record.category,
        amount: 0,
      };
    }
    acc[key].amount += record.amount;
    return acc;
  }, {} as Record<string, { type: 'income' | 'expense'; category: string; amount: number }>);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
        <BarChart3 className="mr-2 h-5 w-5" /> Reporte Financiero
      </h2>
      
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <div className="flex flex-wrap gap-2">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
            className="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 text-sm"
          >
            <option value="all">Todos los periodos</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 text-sm"
          >
            <option value="all">Todos los tipos</option>
            <option value="income">Solo ingresos</option>
            <option value="expense">Solo gastos</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <Filter className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-sm text-gray-500">
            Mostrando {filteredRecords.length} transacciones
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-green-800">Ingresos</h3>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-700 mt-2">${totalIncome.toFixed(2)}</p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-red-800">Gastos</h3>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2">${totalExpense.toFixed(2)}</p>
        </div>
        
        <div className={`rounded-lg p-4 border ${
          balance >= 0
            ? 'bg-blue-50 border-blue-100'
            : 'bg-orange-50 border-orange-100'
        }`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-sm font-medium ${
              balance >= 0 ? 'text-blue-800' : 'text-orange-800'
            }`}>Balance</h3>
            {balance >= 0 
              ? <ArrowUpRight className="h-4 w-4 text-blue-600" /> 
              : <ArrowDownRight className="h-4 w-4 text-orange-600" />
            }
          </div>
          <p className={`text-2xl font-bold mt-2 ${
            balance >= 0 ? 'text-blue-700' : 'text-orange-700'
          }`}>${Math.abs(balance).toFixed(2)}</p>
        </div>
      </div>
      
      {Object.keys(categorySums).length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Distribución por Categoría</h3>
          <div className="space-y-3">
            {Object.values(categorySums).map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={`${
                    item.type === 'income' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {item.category}
                  </span>
                  <span className="font-medium">${item.amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (item.amount / (item.type === 'income' ? totalIncome : totalExpense)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {filteredRecords.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">
                    {record.description}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {record.category}
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium text-right ${
                    record.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {record.type === 'income' ? '+' : '-'}${record.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>No hay transacciones para mostrar</p>
          <p className="text-sm">Ajusta los filtros o añade nuevas transacciones</p>
        </div>
      )}
    </div>
  );
};

export default FinancialReport;