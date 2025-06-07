import React, { useState } from 'react';
import { User } from '../types';
import { useAppContext } from '../context/AppContext';
import { UserPlus, User as UserIcon, X } from 'lucide-react';

const UserSelector: React.FC = () => {
  const { users, currentUser, addUser, selectUser } = useAppContext();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim()) {
      addUser(newUserName, newUserEmail, newUserPhone);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setIsAddingUser(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-6">
      <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
        <UserIcon className="mr-2 h-5 w-5" /> Cliente
      </h2>

      {isAddingUser ? (
        <form onSubmit={handleAddUser} className="space-y-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <input
              type="text"
              id="name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              placeholder="Nombre del cliente"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              placeholder="Email (opcional)"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              value={newUserPhone}
              onChange={(e) => setNewUserPhone(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              placeholder="Teléfono (opcional)"
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
              onClick={() => setIsAddingUser(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div>
          {currentUser ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{currentUser.name}</p>
                {currentUser.email && <p className="text-sm text-gray-500">{currentUser.email}</p>}
                {currentUser.phone && <p className="text-sm text-gray-500">{currentUser.phone}</p>}
              </div>
              <button
                onClick={() => selectUser('')}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="Cambiar cliente"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div>
              {users.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-2">Selecciona un cliente existente:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => selectUser(user.id)}
                        className="text-left px-3 py-2 border border-gray-200 rounded-md hover:bg-amber-50 hover:border-amber-200 transition-colors"
                      >
                        <p className="font-medium">{user.name}</p>
                        {user.email && <p className="text-xs text-gray-500">{user.email}</p>}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setIsAddingUser(true)}
                      className="flex items-center px-4 py-2 text-amber-700 border border-amber-300 rounded-md bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Crear nuevo cliente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">No hay clientes registrados</p>
                  <button
                    onClick={() => setIsAddingUser(true)}
                    className="flex items-center mx-auto px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear primer cliente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSelector;