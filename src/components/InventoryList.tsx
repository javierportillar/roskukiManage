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

  // Separate by size and sort alphabetically
  const largeItems = Object.values(groupedInventory)
    .filter(group => group.size === 'large')
    .sort((a, b) => a.flavor.localeCompare(b.flavor));

  const mediumItems = Object.values(groupedInventory)
    .filter(group => group.size === 'medium')
    .sort((a, b) => a.flavor.localeCompare(b.flavor));

  const InventorySection = ({ 
    title, 
    items, 
    bgColor, 
    borderColor, 
    textColor 
  }: { 
    title: string; 
    items: typeof largeItems; 
    bgColor: string; 
    borderColor: string; 
    textColor: string; 
  }) => (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center`}>
        <Package className="mr-2 h-5 w-5" /> 
        {title}
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({items.length} sabores)
        </span>
      </h3>

      {items.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay galletas {title.toLowerCase()} en inventario</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((group, index) => (
            <div 
              key={index} 
              className={`border ${borderColor} rounded-lg p-4 ${bgColor} hover:shadow-md transition-shadow`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className={`font-medium ${textColor} text-sm leading-tight`}>
                    {group.flavor}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {group.size === 'medium' ? 'Mediana' : 'Grande'}
                  </p>
                </div>
                <div className={`${bgColor === 'bg-blue-50' ? 'bg-blue-100' : 'bg-green-100'} rounded-full p-2`}>
                  <CookieIcon className={`h-4 w-4 ${textColor}`} />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cantidad:</span>
                  <span className={`font-semibold ${textColor}`}>
                    {group.totalQuantity}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lotes:</span>
                  <span className={`font-semibold ${textColor}`}>
                    {group.items.length}
                  </span>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                Último: {new Date(group.items[group.items.length - 1].createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Summary Cards */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-blue-800">Grandes</h3>
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                {largeItems.reduce((sum, item) => sum + item.totalQuantity, 0)}
              </p>
              <p className="text-xs text-blue-600 mt-1">{largeItems.length} sabores</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-green-800">Medianas</h3>
                <Package className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700 mt-2">
                {mediumItems.reduce((sum, item) => sum + item.totalQuantity, 0)}
              </p>
              <p className="text-xs text-green-600 mt-1">{mediumItems.length} sabores</p>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-amber-800">Total Galletas</h3>
                <CookieIcon className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-700 mt-2">
                {Object.values(groupedInventory).reduce((sum, group) => sum + group.totalQuantity, 0)}
              </p>
              <p className="text-xs text-amber-600 mt-1">En inventario</p>
            </div>
            
            {/* <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-purple-800">Sabores Únicos</h3>
                <Package className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-700 mt-2">
                {Object.keys(groupedInventory).length}
              </p>
              <p className="text-xs text-purple-600 mt-1">Diferentes</p>
            </div> */}
          </div>
        )}
      </div>

      {/* Separate sections for Large and Medium */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventorySection
          title="Grandes"
          items={largeItems}
          bgColor="bg-blue-50"
          borderColor="border-blue-100"
          textColor="text-blue-800"
        />
        
        <InventorySection
          title="Medianas"
          items={mediumItems}
          bgColor="bg-green-50"
          borderColor="border-green-100"
          textColor="text-green-800"
        />
      </div>
    </div>
  );
};

export default InventoryList;