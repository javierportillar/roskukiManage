import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Package2, Clock, CheckCircle, XCircle, Cookie, Truck, DollarSign } from 'lucide-react';

const OrdersList: React.FC = () => {
  const { orders, markOrderPrepared, markOrderDelivered, markOrderCancelled } = useAppContext();

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

  const getTotalCookies = (items: any[]) => {
    return items.reduce((total, item) => {
      const cookieCount = item.saleType === 'unit' 
        ? item.quantity 
        : item.quantity * (item.boxQuantity || 0);
      return total + cookieCount;
    }, 0);
  };

  const getOrderStatus = (order: any) => {
    if (order.isCancelled) return 'cancelled';
    if (order.isDelivered) return 'delivered';
    if (order.isPrepared) return 'prepared';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'prepared':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'cancelled':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-amber-50 border-amber-200 text-amber-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'prepared':
        return 'Preparado';
      case 'cancelled':
        return 'Pagado';
      default:
        return 'Pendiente';
    }
  };

  // Sort orders: pending first, then by date
  const sortedOrders = [...orders].sort((a, b) => {
    const statusA = getOrderStatus(a);
    const statusB = getOrderStatus(b);
    
    if (statusA === 'pending' && statusB !== 'pending') return -1;
    if (statusA !== 'pending' && statusB === 'pending') return 1;
    
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
        <Package2 className="mr-2 h-5 w-5" /> Lista de Pedidos
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>No hay pedidos registrados</p>
          <p className="text-sm">Los pedidos aparecerán aquí cuando se completen ventas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => {
            const status = getOrderStatus(order);
            const totalCookies = getTotalCookies(order.items);
            
            return (
              <div key={order.id} className={`border rounded-lg p-4 ${getStatusColor(status)}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{order.userName}</h3>
                    <p className="text-sm opacity-75">
                      Pedido: {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString()}
                    </p>
                    {order.preparedDate && (
                      <p className="text-sm opacity-75">
                        Preparado: {new Date(order.preparedDate).toLocaleDateString()} {new Date(order.preparedDate).toLocaleTimeString()}
                      </p>
                    )}
                    {order.deliveredDate && (
                      <p className="text-sm opacity-75">
                        Entregado: {new Date(order.deliveredDate).toLocaleDateString()} {new Date(order.deliveredDate).toLocaleTimeString()}
                      </p>
                    )}
                    {order.cancelledDate && (
                      <p className="text-sm opacity-75">
                        Cancelado: {new Date(order.cancelledDate).toLocaleDateString()} {new Date(order.cancelledDate).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                    <p className="text-lg font-bold mt-1">${order.total.toFixed(2)}</p>
                    <p className="text-sm opacity-75 flex items-center">
                      <Cookie className="h-4 w-4 mr-1" />
                      {totalCookies} galletas
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Detalles del pedido:</h4>
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
                          <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cant.
                          </th>
                          <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.items.map((item) => (
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
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              ${item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Status Indicators and Action Buttons */}
                <div className="space-y-3">
                  {/* Status Indicators */}
                  <div className="flex flex-wrap gap-2">
                    <div className={`flex items-center px-3 py-1 rounded-full text-xs ${
                      order.isPrepared ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Preparado {order.isPrepared ? '✓' : ''}
                    </div>
                    
                    <div className={`flex items-center px-3 py-1 rounded-full text-xs ${
                      order.isDelivered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Truck className="h-4 w-4 mr-1" />
                      Entregado {order.isDelivered ? '✓' : ''}
                    </div>
                    
                    <div className={`flex items-center px-3 py-1 rounded-full text-xs ${
                      // order.isCancelled ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'
                      order.isCancelled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'

                    }`}>
                      <DollarSign className="h-4 w-4 mr-1" />
                      Pagado {order.isCancelled ? '✓' : ''}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {/* {!order.isCancelled && ( */}
                    <div className="flex flex-wrap gap-2">
                      {!order.isPrepared && (
                        <button
                          onClick={() => markOrderPrepared(order.id)}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Marcar como Preparado
                        </button>
                      )}
                      
                      {!order.isDelivered && (
                        <button
                          onClick={() => markOrderDelivered(order.id)}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Marcar como Entregado
                        </button>
                      )}
                      {!order.isCancelled && (
                        <button
                          onClick={() => markOrderCancelled(order.id)}
                          className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Marcar como Pagado
                        </button>
                      )}
                    </div>
                  
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersList;