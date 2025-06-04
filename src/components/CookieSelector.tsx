import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Cookie as CookieIcon, Plus, Package2 } from 'lucide-react';
import { SaleType } from '../types';

const CookieSelector: React.FC = () => {
  const { flavors, addToSale } = useAppContext();
  const [selectedSize, setSelectedSize] = useState<'medium' | 'large'>('medium');
  const [saleType, setSaleType] = useState<SaleType>('unit');
  const [quantity, setQuantity] = useState(1);
  
  // Track selected flavors and their quantities
  const [selectedFlavors, setSelectedFlavors] = useState<{[key: string]: number}>({});

  const availableFlavors = flavors.filter(flavor => flavor.available);

  // Calculate total selected cookies
  const totalSelectedCookies = Object.values(selectedFlavors).reduce((sum, qty) => sum + qty, 0);

  // Get max cookies based on box type
  const getMaxCookies = () => saleType === 'box4' ? 4 : saleType === 'box6' ? 6 : Infinity;

  // Price calculation based on size and sale type
  // const getBasePrice = () => {
  //   const unitPrice = selectedSize === 'medium' ? 3 : 5;

  // const getBasePrice = (size: 'medium' | 'large' = selectedSize) => {
  //   const unitPrice = size === 'medium' ? 4500 : 6000;
  //   switch (saleType) {
  //     case 'box4':
  //       return unitPrice-500; // 4000 C/U
  //     case 'box6':
  //       return unitPrice * 6 * 0.85; // 15% discount for box of 6
  //     default:
  //       return unitPrice;
  //   }
  // };

  const getBasePrice = (size: 'medium' | 'large' = selectedSize) => {
    if (size === 'medium') {
      switch (saleType) {
        case 'box4':
          return 16000/4;   // precio total de la caja de 4
        case 'box6':
          return 25000/6;   // precio total de la caja de 6
        default:
          return 4500;    // precio por unidad
      }
    } else {
      switch (saleType) {
        case 'box4':
          return 22000/4;
        case 'box6':
          return 35000/6;
        default:
          return 6000;
      }
    }
  };

  
  const handleFlavorQuantityChange = (flavor: string, change: number) => {
    const currentQty = selectedFlavors[flavor] || 0;
    const newQty = Math.max(0, currentQty + change);
    const maxCookies = getMaxCookies();
    
    // Calculate new total excluding current flavor
    const otherTotal = Object.entries(selectedFlavors)
      .reduce((sum, [key, qty]) => key === flavor ? sum : sum + qty, 0);
    
    // Only update if within box limit
    if (otherTotal + newQty <= maxCookies) {
      setSelectedFlavors(prev => ({
        ...prev,
        [flavor]: newQty
      }));
    }
  };

  const handleAddToSale = () => {
    if (Object.keys(selectedFlavors).length > 0) {
      const basePrice = getBasePrice();
      const boxQuantity = saleType === 'unit' ? undefined : (saleType === 'box4' ? 4 : 6);
      
      // Add each selected flavor as a separate sale item
      Object.entries(selectedFlavors).forEach(([flavor, flavorQuantity]) => {
        if (flavorQuantity > 0) {
          addToSale(flavor, selectedSize, quantity, basePrice, saleType, boxQuantity);
        }
      });
      
      // Reset selections
      setSelectedFlavors({});
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-6">
      <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
        <CookieIcon className="mr-2 h-5 w-5" /> Seleccionar Galletas
      </h2>

      <div className="space-y-4">
        {/* Size selection - First */}
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
              {/* Mediana (${(selectedSize === 'medium' ? getBasePrice() : 3).toFixed(2)}) */}
              Mediana (${getBasePrice('medium').toFixed(2)})
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
              {/* Grande (${(selectedSize === 'large' ? getBasePrice() : 5).toFixed(2)}) */}
              Grande (${getBasePrice('large').toFixed(2)})
            </button>
          </div>
        </div>

        {/* Sale Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Venta
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setSaleType('unit');
                setSelectedFlavors({});
              }}
              className={`py-2 px-3 rounded-md text-center flex items-center justify-center ${
                saleType === 'unit'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              <CookieIcon className="h-4 w-4 mr-1" />
              Unidades
            </button>
            <button
              type="button"
              onClick={() => {
                setSaleType('box4');
                setSelectedFlavors({});
              }}
              className={`py-2 px-3 rounded-md text-center flex items-center justify-center ${
                saleType === 'box4'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              <Package2 className="h-4 w-4 mr-1" />
              Caja x4
            </button>
            <button
              type="button"
              onClick={() => {
                setSaleType('box6');
                setSelectedFlavors({});
              }}
              className={`py-2 px-3 rounded-md text-center flex items-center justify-center ${
                saleType === 'box6'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              <Package2 className="h-4 w-4 mr-1" />
              Caja x6
            </button>
          </div>
        </div>

        {/* Multiple Flavor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sabores {saleType !== 'unit' && `(${totalSelectedCookies}/${getMaxCookies()} galletas)`}
          </label>
          <div className="space-y-2">
            {availableFlavors.map((flavor) => (
              <div key={flavor.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{flavor.name}</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleFlavorQuantityChange(flavor.name, -1)}
                    className="px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300 transition-colors"
                    disabled={!selectedFlavors[flavor.name]}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{selectedFlavors[flavor.name] || 0}</span>
                  <button
                    type="button"
                    onClick={() => handleFlavorQuantityChange(flavor.name, 1)}
                    className="px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300 transition-colors"
                    disabled={totalSelectedCookies >= getMaxCookies()}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Box quantity (if not unit sale) */}
        {saleType !== 'unit' && (
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad de Cajas
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
                id="quantity"
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
        )}

        {/* Add to sale button */}
        <button
          type="button"
          onClick={handleAddToSale}
          disabled={totalSelectedCookies === 0 || (saleType !== 'unit' && totalSelectedCookies !== getMaxCookies())}
          className={`w-full py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${
            totalSelectedCookies > 0 && (saleType === 'unit' || totalSelectedCookies === getMaxCookies())
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          } transition-colors`}
        >
          <Plus className="h-4 w-4" />
          <span>Añadir al Carrito</span>
        </button>
        
        {saleType !== 'unit' && totalSelectedCookies !== getMaxCookies() && (
          <p className="text-sm text-red-500 text-center">
            Debes seleccionar exactamente {getMaxCookies()} galletas para completar la caja
          </p>
        )}
      </div>
    </div>
  );
};

export default CookieSelector;