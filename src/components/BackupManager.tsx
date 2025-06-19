import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Download, Database, FileSpreadsheet, AlertCircle, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const BackupManager: React.FC = () => {
  const {
    users,
    flavors,
    inventory,
    inventoryMovements,
    sales,
    orders,
    financialRecords
  } = useAppContext();

  const exportToExcel = () => {
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Clientes
      const clientsData = users.map(user => ({
        'ID': user.id,
        'Nombre': user.name,
        'Email': user.email || '',
        'Teléfono': user.phone || '',
        'Dirección': user.address || '',
        'Fecha Creación': new Date(user.createdAt).toLocaleDateString(),
        'Pedidos': user.orderCount,
        'Total Galletas': user.totalCookies,
        'Cajas x4': user.box4Count,
        'Cajas x6': user.box6Count
      }));
      const clientsSheet = XLSX.utils.json_to_sheet(clientsData);
      XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clientes');

      // Sabores
      const flavorsData = flavors.map(flavor => ({
        'ID': flavor.id,
        'Nombre': flavor.name,
        'Disponible': flavor.available ? 'Sí' : 'No'
      }));
      const flavorsSheet = XLSX.utils.json_to_sheet(flavorsData);
      XLSX.utils.book_append_sheet(workbook, flavorsSheet, 'Sabores');

      // Inventario Actual
      const inventoryData = inventory.map(item => ({
        'ID': item.id,
        'Sabor': item.flavor,
        'Tamaño': item.size === 'medium' ? 'Mediana' : 'Grande',
        'Cantidad': item.quantity,
        'Fecha Creación': new Date(item.createdAt).toLocaleDateString()
      }));
      const inventorySheet = XLSX.utils.json_to_sheet(inventoryData);
      XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventario');

      // Movimientos de Inventario
      const movementsData = inventoryMovements.map(movement => ({
        'ID': movement.id,
        'Sabor': movement.flavor,
        'Tamaño': movement.size === 'medium' ? 'Mediana' : 'Grande',
        'Cantidad': movement.quantity,
        'Tipo': movement.type === 'addition' ? 'Añadido' : 'Deducido',
        'Motivo': movement.reason,
        'Fecha': new Date(movement.date).toLocaleDateString(),
        'Hora': new Date(movement.date).toLocaleTimeString(),
        'ID Pedido': movement.orderId || ''
      }));
      const movementsSheet = XLSX.utils.json_to_sheet(movementsData);
      XLSX.utils.book_append_sheet(workbook, movementsSheet, 'Movimientos');

      // Ventas
      const salesData = sales.flatMap(sale => 
        sale.items.map(item => ({
          'ID Venta': sale.id,
          'Cliente': sale.userName,
          'Fecha': new Date(sale.date).toLocaleDateString(),
          'Hora': new Date(sale.date).toLocaleTimeString(),
          'Sabor': item.flavor,
          'Tamaño': item.size === 'medium' ? 'Mediana' : 'Grande',
          'Tipo Venta': item.saleType === 'unit' ? 'Unidades' : 
                       item.saleType === 'box4' ? 'Caja x4' : 'Caja x6',
          'Cantidad': item.quantity,
          'Galletas Totales': item.saleType === 'unit' ? item.quantity : 
                             item.quantity * (item.saleType === 'box4' ? 4 : 6),
          'Precio Unitario': item.price,
          'Total Item': item.total,
          'Total Venta': sale.total
        }))
      );
      const salesSheet = XLSX.utils.json_to_sheet(salesData);
      XLSX.utils.book_append_sheet(workbook, salesSheet, 'Ventas');

      // Pedidos
      const ordersData = orders.flatMap(order => 
        order.items.map(item => ({
          'ID Pedido': order.id,
          'Cliente': order.userName,
          'Fecha Pedido': new Date(order.date).toLocaleDateString(),
          'Hora Pedido': new Date(order.date).toLocaleTimeString(),
          'Sabor': item.flavor,
          'Tamaño': item.size === 'medium' ? 'Mediana' : 'Grande',
          'Tipo': item.saleType === 'unit' ? 'Unidades' : 
                  item.saleType === 'box4' ? 'Caja x4' : 'Caja x6',
          'Cantidad': item.quantity,
          'Galletas Totales': item.saleType === 'unit' ? item.quantity : 
                             item.quantity * (item.saleType === 'box4' ? 4 : 6),
          'Total Item': item.total,
          'Total Pedido': order.total,
          'Preparado': order.isPrepared ? 'Sí' : 'No',
          'Fecha Preparado': order.preparedDate ? new Date(order.preparedDate).toLocaleDateString() : '',
          'Entregado': order.isDelivered ? 'Sí' : 'No',
          'Fecha Entregado': order.deliveredDate ? new Date(order.deliveredDate).toLocaleDateString() : '',
          'Pagado': order.isCancelled ? 'Sí' : 'No',
          'Fecha Pagado': order.cancelledDate ? new Date(order.cancelledDate).toLocaleDateString() : ''
        }))
      );
      const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
      XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Pedidos');

      // Finanzas
      const financialData = financialRecords.map(record => ({
        'ID': record.id,
        'Fecha': new Date(record.date).toLocaleDateString(),
        'Hora': new Date(record.date).toLocaleTimeString(),
        'Tipo': record.type === 'income' ? 'Ingreso' : 'Gasto',
        'Descripción': record.description,
        'Monto': record.amount,
        'Categoría': record.category
      }));
      const financialSheet = XLSX.utils.json_to_sheet(financialData);
      XLSX.utils.book_append_sheet(workbook, financialSheet, 'Finanzas');

      // Generate filename with current date
      const now = new Date();
      const filename = `Roskuki_Datos_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

      // Save file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, filename);

      alert('¡Datos exportados a Excel exitosamente!');
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar los datos. Por favor intenta de nuevo.');
    }
  };

  const exportBackupJSON = () => {
    try {
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          users,
          flavors,
          inventory,
          inventoryMovements,
          sales,
          orders,
          financialRecords
        }
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const now = new Date();
      const filename = `Roskuki_Backup_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}.json`;
      
      saveAs(dataBlob, filename);
      alert('¡Backup JSON exportado exitosamente!');
    } catch (error) {
      console.error('Error al exportar backup JSON:', error);
      alert('Error al exportar el backup JSON. Por favor intenta de nuevo.');
    }
  };

  const totalRecords = users.length + sales.length + orders.length + inventory.length + financialRecords.length;

  // Calculate statistics
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = orders.length;
  const totalInventoryItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalMovements = inventoryMovements.length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-blue-800">Total Registros</h3>
            <Database className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{totalRecords}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-green-800">Ventas Totales</h3>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-700 mt-2">${totalSales.toFixed(2)}</p>
        </div>
        
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-amber-800">Pedidos</h3>
            <FileSpreadsheet className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{totalOrders}</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-purple-800">Inventario</h3>
            <Database className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-2">{totalInventoryItems}</p>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
          <Download className="mr-2 h-5 w-5" /> Exportar Datos
        </h2>

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Información sobre la exportación:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>Excel:</strong> Perfecto para análisis, reportes y visualización de datos</li>
                <li><strong>JSON:</strong> Formato técnico para backup completo y transferencia entre dispositivos</li>
                <li>Los archivos incluyen fecha y hora para fácil identificación</li>
                <li>Todos los datos se exportan organizados en hojas/secciones separadas</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <FileSpreadsheet className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Exportar a Excel</div>
              <div className="text-sm opacity-90">Para análisis y reportes</div>
            </div>
          </button>
          
          <button
            onClick={exportBackupJSON}
            className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Download className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Exportar Backup JSON</div>
              <div className="text-sm opacity-90">Para backup completo</div>
            </div>
          </button>
        </div>

        {/* Data breakdown */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Datos que se exportarán:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{users.length}</div>
              <div className="text-gray-600">Clientes</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{sales.length}</div>
              <div className="text-gray-600">Ventas</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-amber-600">{orders.length}</div>
              <div className="text-gray-600">Pedidos</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">{inventory.length}</div>
              <div className="text-gray-600">Items Inventario</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-600">{inventoryMovements.length}</div>
              <div className="text-gray-600">Movimientos</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-indigo-600">{financialRecords.length}</div>
              <div className="text-gray-600">Registros Financieros</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-pink-600">{flavors.length}</div>
              <div className="text-gray-600">Sabores</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-600">{totalRecords}</div>
              <div className="text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Instructions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-amber-800 mb-4">💡 Cómo sincronizar entre dispositivos</h3>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 mb-3">
            <strong>Problema:</strong> Los datos se guardan localmente en cada dispositivo y no se sincronizan automáticamente.
          </p>
          <p className="text-sm text-amber-800 mb-3">
            <strong>Solución temporal:</strong> Usa el backup JSON para transferir datos entre dispositivos:
          </p>
          <ol className="list-decimal list-inside text-sm text-amber-700 space-y-1 ml-4">
            <li>En el dispositivo con datos actualizados: Exporta backup JSON</li>
            <li>Envía el archivo al otro dispositivo (WhatsApp, email, etc.)</li>
            <li>En el otro dispositivo: Descarga el archivo y úsalo para restaurar</li>
          </ol>
          <p className="text-xs text-amber-600 mt-3">
            <strong>Nota:</strong> Para una solución permanente, se recomienda implementar una base de datos en la nube.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;