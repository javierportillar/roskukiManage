import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { SupabaseService } from '../services/supabaseService';
import { RefreshCw, Upload, Download } from 'lucide-react';

const SyncButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    users, setUsers, 
    sales, setSales, 
    orders, setOrders,
    inventory, setInventory,
    financialRecords, setFinancialRecords,
    flavors, setFlavors
  } = useAppContext();

  const syncToCloud = async () => {
    setIsLoading(true);
    try {
      // Subir datos locales a Supabase
      for (const user of users) {
        await SupabaseService.createUser(user);
      }
      
      for (const sale of sales) {
        await SupabaseService.createSale(sale);
      }
      
      // ... más sincronizaciones
      
      alert('Datos sincronizados exitosamente');
    } catch (error) {
      console.error('Error al sincronizar:', error);
      alert('Error al sincronizar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const syncFromCloud = async () => {
    setIsLoading(true);
    try {
      // Descargar datos de Supabase
      const cloudUsers = await SupabaseService.getUsers();
      const cloudSales = await SupabaseService.getSales();
      const cloudOrders = await SupabaseService.getOrders();
      const cloudInventory = await SupabaseService.getInventory();
      const cloudFinancial = await SupabaseService.getFinancialRecords();
      const cloudFlavors = await SupabaseService.getFlavors();

      // Actualizar estado local
      setUsers(cloudUsers);
      setSales(cloudSales);
      setOrders(cloudOrders);
      setInventory(cloudInventory);
      setFinancialRecords(cloudFinancial);
      setFlavors(cloudFlavors);
      
      alert('Datos descargados exitosamente');
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      {/* <button
        onClick={syncToCloud}
        disabled={isLoading}
        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
      >
        <Upload className="h-4 w-4 mr-1" />
        Subir
      </button> */}
      
      <button
        onClick={syncFromCloud}
        disabled={isLoading}
        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
      >
        <Download className="h-4 w-4 mr-1" />
        Descargar
      </button>
      
      {isLoading && (
        <RefreshCw className="h-5 w-5 animate-spin text-amber-600" />
      )}
    </div>
  );
};

export default SyncButton;