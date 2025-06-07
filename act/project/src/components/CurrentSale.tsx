import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ShoppingCart, Trash2, Save, Package2 } from 'lucide-react';

const CurrentSale: React.FC = () => {
  const { currentSale, currentUser, removeFromSale, updateSaleItemQuantity, completeSale } = useAppContext();

  const total = currentSale.reduce((sum, item) => sum + item.total, 0);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateSaleItemQuantity(id, newQuantity);
    } else {
      removeFromSale(id);
    }
  };

  const getSaleTypeLabel = (saleType: string, boxQuantity?: number) => {
    switch (saleType) {
      case 'box4':
        // return `Caja x4 (${boxQuantity! * 4} galletas)`;
        return `Caja x4 (${boxQuantity} galletas)`;
      case 'box6':
        // return `Caja x6 (${boxQuantity! * 6} galletas)`;
        return `Caja x6 (${boxQuantity} galletas)`;
      default:
        return 'Unidades';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
        <ShoppingCart className="mr-2 h-5 w-5" /> Carrito de Compra
      </h2>

      {currentSale.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>El carrito está vacío</p>
          <p className="text-sm">Añade galletas para comenzar una venta</p>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Galleta
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cant.
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentSale.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
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
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="px-2 py-1 bg-gray-100 rounded-l border border-gray-300 hover:bg-gray-200 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-10 py-1 text-center border-t border-b border-gray-300">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-100 rounded-r border border-gray-300 hover:bg-gray-200 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      ${item.total.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeFromSale(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-amber-50">
                  <td colSpan={5} className="px-3 py-3 text-right text-sm font-bold text-gray-900">
                    Total:
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-gray-900">
                    ${total.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={completeSale}
              disabled={!currentUser || currentSale.length === 0}
              className={`py-2 px-6 rounded-md flex items-center space-x-2 ${
                currentUser && currentSale.length > 0
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              } transition-colors`}
            >
              <Save className="h-5 w-5" />
              <span>Completar Venta</span>
            </button>
          </div>
          
          {!currentUser && (
            <p className="mt-2 text-center text-sm text-red-500">
              Debes seleccionar un cliente para completar la venta
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrentSale;