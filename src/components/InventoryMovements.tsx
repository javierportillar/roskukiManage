import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { History, ArrowUp, ArrowDown, Filter, Package } from 'lucide-react';

type MovementFilter = 'all' | 'addition' | 'deduction';
type PeriodFilter = 'all' | 'today' | 'week' | 'month';

const InventoryMovements: React.FC = () => {
  const { inventoryMovements, inventory } = useAppContext();
  const [movementFilter, setMovementFilter] = useState<MovementFilter>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [flavorFilter, setFlavorFilter] = useState<string>('all');

  const filterByPeriod = (date: Date, filter: PeriodFilter): boolean => {
    const movementDate = new Date(date);
    const today = new Date();
    
    switch (filter) {
      case 'today':
        return (
          movementDate.getDate() === today.getDate() &&
          movementDate.getMonth() === today.getMonth() &&
          movementDate.getFullYear() === today.getFullYear()
        );
      case 'week':{
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        return movementDate >= oneWeekAgo;
      }
      case 'month':{
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        return movementDate >= oneMonthAgo;
      }
      default:
        return true;
    }
  };

  const filteredMovements = inventoryMovements
    .filter(movement => movementFilter === 'all' || movement.type === movementFilter)
    .filter(movement => periodFilter === 'all' || filterByPeriod(movement.date, periodFilter))
    .filter(movement => flavorFilter === 'all' || movement.flavor === flavorFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get unique flavors for filter
  const uniqueFlavors = Array.from(new Set(inventoryMovements.map(m => m.flavor)));

  // Calculate totals
  const totalAdditions = filteredMovements
    .filter(m => m.type === 'addition')
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalDeductions = filteredMovements
    .filter(m => m.type === 'deduction')
    .reduce((sum, m) => sum + m.quantity, 0);

  // Calculate current inventory totals
  const currentInventoryTotals = inventory.reduce((acc, item) => {
    const key = `${item.flavor}-${item.size}`;
    if (!acc[key]) {
      acc[key] = {
        flavor: item.flavor,
        size: item.size,
        total: 0,
      };
    }
    acc[key].total += item.quantity;
    return acc;
  }, {} as Record<string, { flavor: string; size: string; total: number }>);

  const totalCurrentInventory = Object.values(currentInventoryTotals)
    .reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6">
      {/* Current Inventory Summary */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
          <Package className="mr-2 h-5 w-5" /> Resumen de Inventario Actual
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-blue-800">Total Galletas</h3>
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-700 mt-2">{totalCurrentInventory}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-green-800">Total Añadidas</h3>
              <ArrowUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700 mt-2">{totalAdditions}</p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-red-800">Total Deducidas</h3>
              <ArrowDown className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-700 mt-2">{totalDeductions}</p>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-amber-800">Sabores Únicos</h3>
              <Package className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-700 mt-2">{Object.keys(currentInventoryTotals).length}</p>
          </div>
        </div>

        {/* Current Inventory Table */}
        {Object.keys(currentInventoryTotals).length > 0 && (
          <div className="overflow-x-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Inventario por Sabor y Tamaño</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sabor
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.values(currentInventoryTotals).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                      {item.flavor}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {item.size === 'medium' ? 'Mediana' : 'Grande'}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">
                      {item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Movements History */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
          <History className="mr-2 h-5 w-5" /> Historial de Movimientos
        </h2>
        
        <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
          <div className="flex flex-wrap gap-2">
            <select
              value={movementFilter}
              onChange={(e) => setMovementFilter(e.target.value as MovementFilter)}
              className="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 text-sm"
            >
              <option value="all">Todos los movimientos</option>
              <option value="addition">Solo añadidas</option>
              <option value="deduction">Solo deducidas</option>
            </select>
            
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
              value={flavorFilter}
              onChange={(e) => setFlavorFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 text-sm"
            >
              <option value="all">Todos los sabores</option>
              {uniqueFlavors.map((flavor) => (
                <option key={flavor} value={flavor}>
                  {flavor}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-sm text-gray-500">
              Mostrando {filteredMovements.length} movimientos
            </span>
          </div>
        </div>

        {filteredMovements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sabor
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(movement.date).toLocaleDateString()} {new Date(movement.date).toLocaleTimeString()}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">
                      {movement.flavor}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {movement.size === 'medium' ? 'Mediana' : 'Grande'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        movement.type === 'addition'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {movement.type === 'addition' ? (
                          <ArrowUp className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDown className="h-3 w-3 mr-1" />
                        )}
                        {movement.type === 'addition' ? 'Añadida' : 'Deducida'}
                      </span>
                    </td>
                    <td className={`px-3 py-2 whitespace-nowrap text-sm font-medium text-center ${
                      movement.type === 'addition' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.type === 'addition' ? '+' : '-'}{movement.quantity}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {movement.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No hay movimientos para mostrar</p>
            <p className="text-sm">Ajusta los filtros o añade galletas al inventario</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryMovements;