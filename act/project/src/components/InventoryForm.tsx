import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Package } from 'lucide-react';

const InventoryForm: React.FC = () => {
  const { flavors, addToInventory, addFlavor } = useAppContext();
  
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [selectedSize, setSelectedSize] = useState<'medium' | 'large'>('medium');
  const [quantity, setQuantity] = useState(1);
  const [isAddingFlavor, setIsAddingFlavor] = useState(false);
  const [newFlavorName, setNewFlavorName] = useState('');

  const handleAddToInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFlavor && quantity > 0) {
      addToInventory(selectedFlavor, selectedSize, quantity);
      setQuantity(1);
    }
  };

  const handleAddFlavor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFlavorName.trim()) {
      addFlavor(newFlavorName);
      setNewFlavorName('');
      setIsAddingFlavor(false);
      setSelectedFlavor(newFlavorName);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-6">
      <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
        <Package className="mr-2 h-5 w-5" /> Añadir al Inventario
      </h2>

      {isAddingFlavor ? (
        <form onSubmit={handleAddFlavor} className="space-y-4">
          <div>
            <label htmlFor="newFlavor" className="block text-sm font-medium text-gray-700 mb-1">
              Nuevo Sabor
            </label>
            <input
              type="text"
              id="newFlavor"
              value={newFlavorName}
              onChange={(e) => setNewFlavorName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              placeholder="Nombre del nuevo sabor"
              required
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition-colors"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setIsAddingFlavor(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAddToInventory} className="space-y-4">
          <div>
            <label htmlFor="flavor" className="block text-sm font-medium text-gray-700 mb-1">
              Sabor
            </label>
            <div className="flex space-x-2">
              <select
                id="flavor"
                value={selectedFlavor}
                onChange={(e) => setSelectedFlavor(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                required
              >
                <option value="">Selecciona un sabor</option>
                {flavors.map((flavor) => (
                  <option key={flavor.id} value={flavor.name}>
                    {flavor.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsAddingFlavor(true)}
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                title="Añadir nuevo sabor"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamaño
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setSelectedSize('medium')}
                className={`flex-1 py-2 px-4 rounded-md text-center ${
                  selectedSize === 'medium'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
              >
                Mediana
              </button>
              <button
                type="button"
                onClick={() => setSelectedSize('large')}
                className={`flex-1 py-2 px-4 rounded-md text-center ${
                  selectedSize === 'large'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors`}
              >
                Grande
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="inventoryQuantity" className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad
            </label>
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md hover:bg-gray-200 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                id="inventoryQuantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 border-y border-gray-300 text-center focus:ring focus:ring-amber-200 focus:ring-opacity-50 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir al Inventario
          </button>
        </form>
      )}
    </div>
  );
};

export default InventoryForm;