import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Package, CookieIcon } from 'lucide-react';

const InventoryList: React.FC = () => {
  const { inventory } = useAppContext();

  // Group inventory by flavor and size
  const groupedInventory = inventory.reduce((acc, item) => {
    const key = `${item.flavor}-${item.size}`;
    if (!acc[key]) {
      acc[key] = {
        flavor: item.flavor,
        size: item.size,
        totalQuantity: 0,
        items: [],
      };
    }
    acc[key].totalQuantity += item.quantity;
    acc[key].items.push(item);
    return acc;
  }, {} as Record<string, { flavor: string; size: string; totalQuantity: number; items: typeof inventory }> );

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
        <Package className="mr-2 h-5 w-5" /> Inventario Actual
      </h2>

      {Object.keys(groupedInventory).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>No hay galletas en el inventario</p>
          <p className="text-sm">Añade galletas para iniciar el inventario</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(groupedInventory).map((group, index) => (
            <div 
              key={index} 
              className="border border-amber-100 rounded-lg p-4 bg-amber-50 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-amber-800">{group.flavor}</h3>
                  <p className="text-sm text-gray-600">
                    {group.size === 'medium' ? 'Mediana' : 'Grande'}
                  </p>
                </div>
                <div className="bg-amber-100 rounded-full p-2">
                  <CookieIcon className="h-5 w-5 text-amber-700" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cantidad total:</span>
                  <span className="font-semibold text-amber-900">{group.totalQuantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lotes:</span>
                  <span className="font-semibold text-amber-900">{group.items.length}</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Último lote: {new Date(group.items[group.items.length - 1].createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryList;