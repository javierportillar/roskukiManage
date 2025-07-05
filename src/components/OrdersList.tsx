import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Order, SaleItem, OrderItem } from '../types';
import { Package2, Clock, CheckCircle, Cookie, Truck, DollarSign, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const OrdersList: React.FC = () => {
  const { orders, markOrderPrepared, markOrderDelivered, markOrderPaid, deleteOrder } = useAppContext();
  const [currentPage, setCurrentPage] = useState(0);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const itemsPerPage = 10;

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

  const getTotalCookies = (items: (SaleItem | OrderItem)[]) => {
    return items.reduce((total, item) => {
      const cookieCount = item.saleType === 'unit'
        ? item.quantity
        : item.quantity;
      return total + cookieCount;
    }, 0);
  };

  const getOrderSummary = (items: OrderItem[]) => {
    let box4Cookies = 0;
    let box6Cookies = 0;
    let units = 0;
    items.forEach(item => {
      if (item.saleType === 'box4') box4Cookies += item.quantity;
      else if (item.saleType === 'box6') box6Cookies += item.quantity;
      else units += item.quantity;
    });
    return {
      box4: box4Cookies / 4,
      box6: box6Cookies / 6,
      unit: units
    };
  };

  const getOrderStatus = (order: Order) => {
    if (order.isPaid) return 'paid';
    if (order.isDelivered) return 'delivered';
    if (order.isPrepared) return 'prepared';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'prepared':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'paid':
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
      case 'paid':
        return 'Pagado';
      default:
        return 'Pendiente';
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const confirmMessage = `¿Estás seguro de que quieres eliminar el pedido de ${order.userName}?\n\nEsta acción eliminará:\n- El pedido y todos sus items\n- Los registros financieros relacionados\n\nEsta acción NO se puede deshacer.`;
    
    if (window.confirm(confirmMessage)) {
      setDeletingOrderId(orderId);
      try {
        await deleteOrder(orderId);
        console.log('✅ Pedido eliminado exitosamente');
      } catch (error) {
        console.error('❌ Error eliminando pedido:', error);
        alert('Error al eliminar el pedido. Por favor intenta de nuevo.');
      } finally {
        setDeletingOrderId(null);
      }
    }
  };

  // Sort orders: pending first, then by creation date (NOT updated_at)
  // This ensures that updating order status doesn't change the position
  // const sortedOrders = [...orders].sort((a, b) => {
  //   const statusA = getOrderStatus(a);
  //   const statusB = getOrderStatus(b);
    
  //   // Pending orders first
  //   if (statusA === 'pending' && statusB !== 'pending') return -1;
  //   if (statusA !== 'pending' && statusB === 'pending') return 1;
    
  //   // Then sort by creation date (newest first) - this maintains original order
  //   return new Date(b.date).getTime() - new Date(a.date).getTime();
  // });

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = sortedOrders.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-amber-800 flex items-center">
          <Package2 className="mr-2 h-5 w-5" /> Lista de Pedidos
        </h2>
        
        {orders.length > 0 && (
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, sortedOrders.length)} de {sortedOrders.length} pedidos
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>No hay pedidos registrados</p>
          <p className="text-sm">Los pedidos aparecerán aquí cuando se completen ventas</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {currentOrders.map((order) => {
              const status = getOrderStatus(order);
              const totalCookies = getTotalCookies(order.items);
              const summary = getOrderSummary(order.items);
              const isDeleting = deletingOrderId === order.id;

              return (
                <div key={order.id} className={`border rounded-lg p-4 ${getStatusColor(status)} ${isDeleting ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{order.userName}</h3>
                        {!order.isDelivered && (
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={isDeleting}
                            className={`p-2 rounded-full transition-colors ${
                              isDeleting
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800'
                            }`}
                            title={isDeleting ? 'Eliminando...' : 'Eliminar pedido'}
                          >
                            <Trash2 className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} />
                          </button>
                        )}
                      </div>
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
                      {order.paidDate && (
                        <p className="text-sm opacity-75">
                          Pagado: {new Date(order.paidDate).toLocaleDateString()} {new Date(order.paidDate).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusLabel(status)}
                      </span>
                      <p className="text-lg font-bold mt-1">${order.total.toFixed(2)}</p>
                      <p className="text-sm opacity-75 flex items-center">
                        <Cookie className="h-4 w-4 mr-1" />
                        {totalCookies} galletas
                      </p>
                      <p className="text-xs opacity-75 mt-1">
                        {summary.box4 > 0 && `${summary.box4} caja(s) x4`}
                        {summary.box4 > 0 && (summary.box6 > 0 || summary.unit > 0) && ' - '}
                        {summary.box6 > 0 && `${summary.box6} caja(s) x6`}
                        {summary.box6 > 0 && summary.unit > 0 && ' - '}
                        {summary.unit > 0 && `${summary.unit} individual(es)`}
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
                        order.isPaid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <DollarSign className="h-4 w-4 mr-1" />
                        Pagado {order.isPaid ? '✓' : ''}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {!order.isPrepared && !isDeleting && (
                        <button
                          onClick={() => markOrderPrepared(order.id)}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Marcar como Preparado
                        </button>
                      )}
                      
                      {!order.isDelivered && !isDeleting && (
                        <button
                          onClick={() => markOrderDelivered(order.id)}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Marcar como Entregado
                        </button>
                      )}
                      
                      {!order.isPaid && !isDeleting && (
                        <button
                          onClick={() => markOrderPaid(order.id)}
                          className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Marcar como Pagado
                        </button>
                      )}

                      {isDeleting && (
                        <div className="flex items-center px-3 py-2 bg-gray-200 text-gray-500 rounded-md text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                          Eliminando pedido...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </button>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === totalPages - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-700 mr-2">Página:</span>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === i
                        ? 'bg-amber-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div className="text-sm text-gray-700">
                Página {currentPage + 1} de {totalPages}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersList;