import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, Package2, Cookie, Edit2, Save, X, Phone, Mail, MapPin } from 'lucide-react';
import { User } from '../types';

const CustomersList: React.FC = () => {
  const { users, updateUser } = useAppContext();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleEditStart = (user: User) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    });
  };

  const handleEditSave = async () => {
    if (editingUser && editForm.name.trim()) {
      try {
        await updateUser(editingUser, {
          name: editForm.name,
          email: editForm.email || undefined,
          phone: editForm.phone || undefined,
          address: editForm.address || undefined,
        });
        setEditingUser(null);
        setEditForm({ name: '', email: '', phone: '', address: '' });
      } catch (error) {
        console.error('Error updating user:', error);
        alert('Error al actualizar el cliente. Por favor intenta de nuevo.');
      }
    }
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '', phone: '', address: '' });
  };

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
              {editingUser === user.id ? (
                // Modo edición
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-amber-800 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full text-sm border-gray-300 rounded focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                      placeholder="Nombre del cliente"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-amber-800 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full text-sm border-gray-300 rounded focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                      placeholder="Número de teléfono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-amber-800 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full text-sm border-gray-300 rounded focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                      placeholder="Correo electrónico"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-amber-800 mb-1">
                      Dirección
                    </label>
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      rows={2}
                      className="w-full text-sm border-gray-300 rounded focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                      placeholder="Dirección completa"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={handleEditSave}
                      disabled={!editForm.name.trim()}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Guardar
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo visualización
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 text-lg">{user.name}</h3>
                      
                      <div className="space-y-1 mt-2">
                        {user.phone && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-amber-600" />
                            {user.phone}
                          </p>
                        )}
                        {user.email && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-amber-600" />
                            {user.email}
                          </p>
                        )}
                        {user.address && (
                          <p className="text-sm text-gray-600 flex items-start">
                            <MapPin className="h-4 w-4 mr-2 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span>{user.address}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleEditStart(user)}
                      className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-full transition-colors"
                      title="Editar cliente"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
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
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomersList;