import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ShoppingCart, Trash2, Save, Package2, Loader2 } from 'lucide-react';

const CurrentSale: React.FC = () => {
  const { 
    currentSale, 
    currentUser, 
    removeFromSale, 
    updateSaleItemQuantity, 
    completeSale,
    isCompletingSale // Loading state from context
  } = useAppContext();

  const total = currentSale.reduce((sum, item) => sum + item.total, 0);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (isCompletingSale) return; // Prevent changes during processing
    
    if (newQuantity > 0) {
      updateSaleItemQuantity(id, newQuantity);
    } else {
      removeFromSale(id);
    }
  };

  const handleRemoveFromSale = (id: string) => {
    if (isCompletingSale) return; // Prevent removal during processing
    removeFromSale(id);
  };

  const handleCompleteSale = async () => {
    if (isCompletingSale) return; // Prevent multiple clicks
    await completeSale();
  };

  const getSaleTypeLabel = (saleType: string, boxQuantity?: number) => {
    switch (saleType) {
      case 'box4':
        return `Caja x4 (${boxQuantity} galletas)`;
      case 'box6':
        return `Caja x6 (${boxQuantity} galletas)`;
      default:
        return 'Unidades';
    }
  };

  const isButtonDisabled = !currentUser || currentSale.length === 0 || isCompletingSale;

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
                  <tr key={item.id} className={`hover:bg-gray-50 ${isCompletingSale ? 'opacity-60' : ''}`}>
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
                          disabled={isCompletingSale}
                          className={`px-2 py-1 rounded-l border border-gray-300 transition-colors ${
                            isCompletingSale 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          -
                        </button>
                        <span className="w-10 py-1 text-center border-t border-b border-gray-300 bg-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={isCompletingSale}
                          className={`px-2 py-1 rounded-r border border-gray-300 transition-colors ${
                            isCompletingSale 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
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
                        onClick={() => handleRemoveFromSale(item.id)}
                        disabled={isCompletingSale}
                        className={`transition-colors ${
                          isCompletingSale 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-800'
                        }`}
                        title={isCompletingSale ? 'Procesando venta...' : 'Eliminar item'}
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

          <div className="mt-6 flex flex-col items-center space-y-3">
            <button
              type="button"
              onClick={handleCompleteSale}
              disabled={isButtonDisabled}
              className={`py-3 px-8 rounded-lg flex items-center space-x-3 transition-all duration-200 font-medium text-lg ${
                isButtonDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              }`}
            >
              {isCompletingSale ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Procesando Venta...</span>
                </>
              ) : (
                <>
                  <Save className="h-6 w-6" />
                  <span>Completar Venta</span>
                </>
              )}
            </button>
            
            {/* Status messages */}
            {!currentUser && !isCompletingSale && (
              <p className="text-center text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                ⚠️ Debes seleccionar un cliente para completar la venta
              </p>
            )}
            
            {isCompletingSale && (
              <div className="text-center">
                <p className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 mb-2">
                  🔄 Procesando venta, por favor espera...
                </p>
                <p className="text-xs text-gray-500">
                  No cierres esta ventana ni hagas clic nuevamente
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentSale;