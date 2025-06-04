import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Package2, Cookie } from 'lucide-react';

const CustomersList: React.FC = () => {
  const { users } = useAppContext();

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
        <Users className="mr-2 h-5 w-5" /> Lista de Clientes
      </h2>

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p>No hay clientes registrados</p>
          <p className="text-sm">Añade un cliente para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <div key={user.id} className="border border-amber-100 rounded-lg p-4 bg-amber-50">
              <div className="mb-3">
                <h3 className="font-semibold text-amber-900">{user.name}</h3>
                {user.phone && (
                  <p className="text-sm text-gray-600">📞 {user.phone}</p>
                )}
                {user.address && (
                  <p className="text-sm text-gray-600">📍 {user.address}</p>
                )}
                {user.email && (
                  <p className="text-sm text-gray-600">✉️ {user.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-amber-100/50 rounded p-2">
                  <div className="flex items-center justify-between text-sm text-amber-900">
                    <span className="flex items-center">
                      <Cookie className="h-4 w-4 mr-1" />
                      Pedidos
                    </span>
                    <span className="font-semibold">{user.orderCount}</span>
                  </div>
                </div>

                <div className="bg-amber-100/50 rounded p-2">
                  <div className="flex items-center justify-between text-sm text-amber-900">
                    <span className="flex items-center">
                      <Cookie className="h-4 w-4 mr-1" />
                      Galletas
                    </span>
                    <span className="font-semibold">{user.totalCookies}</span>
                  </div>
                </div>

                <div className="bg-amber-100/50 rounded p-2">
                  <div className="flex items-center justify-between text-sm text-amber-900">
                    <span className="flex items-center">
                      <Package2 className="h-4 w-4 mr-1" />
                      Cajas x4
                    </span>
                    <span className="font-semibold">{user.box4Count}</span>
                  </div>
                </div>

                <div className="bg-amber-100/50 rounded p-2">
                  <div className="flex items-center justify-between text-sm text-amber-900">
                    <span className="flex items-center">
                      <Package2 className="h-4 w-4 mr-1" />
                      Cajas x6
                    </span>
                    <span className="font-semibold">{user.box6Count}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Cliente desde: {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomersList;