import React from 'react';
import { useAppContext } from '../context/AppContext';
import { History, Package2 } from 'lucide-react';

const SalesHistory: React.FC = () => {
  const { sales } = useAppContext();

  const getSaleTypeLabel = (saleType: string, boxQuantity?: number) => {
    switch (saleType) {
      case 'box4':
        return `Caja x4 (${boxQuantity!} galletas)`;
      case 'box6':
        return `Caja x6 (${boxQuantity!} galletas)`;
      default:
        return 'Unidades';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
        <History className="mr-2 h-5 w-5" /> Historial de Ventas
      </h2>

      {sales.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <History className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>No hay ventas registradas</p>
          <p className="text-sm">Las ventas completadas aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <div key={sale.id} className="border border-amber-100 rounded-lg p-4 bg-amber-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-amber-900">{sale.userName}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString()}
                  </p>
                </div>
                <span className="text-lg font-bold text-amber-900">
                  ${sale.total.toFixed(2)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-amber-200">
                  <thead className="bg-amber-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Galleta
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Tamaño
                      </th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Precio
                      </th>
                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Cant.
                      </th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-amber-100">
                    {sale.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {item.flavor}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {item.size === 'medium' ? 'Mediana' : 'Grande'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          <span className="flex items-center">
                            {item.saleType !== 'unit' && <Package2 className="h-4 w-4 mr-1" />}
                            {getSaleTypeLabel(item.saleType, item.boxQuantity)}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-amber-900 text-right">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesHistory;