import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { DollarSign, Plus } from 'lucide-react';

const FinancialForm: React.FC = () => {
  const { addFinancialRecord } = useAppContext();
  
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  
  const categories = {
    income: ['Ventas', 'Inversión', 'Reembolso', 'Otro'],
    expense: ['Ingredientes', 'Equipo', 'Empaque', 'Marketing', 'Salarios', 'Servicios', 'Otro']
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (description && amount && category) {
      addFinancialRecord(
        type,
        description,
        parseFloat(amount),
        category
      );
      
      setDescription('');
      setAmount('');
      setCategory('');
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-6">
      <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
        <DollarSign className="mr-2 h-5 w-5" /> Registrar Transacción
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Transacción
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 px-4 rounded-md text-center transition-colors ${
                type === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 px-4 rounded-md text-center transition-colors ${
                type === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gasto
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            placeholder="Descripción de la transacción"
            required
          />
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Monto ($)
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories[type].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md text-white transition-colors flex items-center justify-center ${
            type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar {type === 'income' ? 'Ingreso' : 'Gasto'}
        </button>
      </form>
    </div>
  );
};

export default FinancialForm;