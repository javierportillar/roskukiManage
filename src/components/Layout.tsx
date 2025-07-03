import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CookieIcon, BarChart3, Package, ShoppingCart, Menu, X, Users, ClipboardList, Download, LogOut } from 'lucide-react';
import SyncStatus from './SyncStatus';
import SyncButton from './SyncButton';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const { isConnected, isLoading } = useAppContext();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/ventas', label: 'Ventas', icon: <ShoppingCart className="w-5 h-5" /> },
    { path: '/orders', label: 'Pedidos', icon: <ClipboardList className="w-5 h-5" /> },
    { path: '/inventory', label: 'Inventario', icon: <Package className="w-5 h-5" /> },
    { path: '/financial', label: 'Finanzas', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/customers', label: 'Clientes', icon: <Users className="w-5 h-5" /> },
    { path: '/backup', label: 'Exportar', icon: <Download className="w-5 h-5" /> },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-700 to-amber-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/ventas" className="flex items-center space-x-2 font-bold text-xl hover:text-amber-100 transition-colors">
            <CookieIcon className="h-8 w-8" />
            <span>Controlador Roskuki</span>
          </Link>
          
          {/* User info and controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User info */}
            <div className="flex items-center space-x-2 bg-amber-800/30 rounded-lg px-3 py-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium">{user?.username}</span>
            </div>
            
            <SyncStatus />
            {isConnected && <SyncButton />}
            {isLoading && (
              <div className="text-amber-100 text-sm">
                Sincronizando...
              </div>
            )}
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Salir
            </button>
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-full hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg flex items-center space-x-1 transition-all ${
                  location.pathname === item.path
                    ? 'bg-amber-800 text-white font-medium'
                    : 'text-amber-100 hover:bg-amber-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-amber-700 text-white">
          <div className="container mx-auto px-4 py-2">
            {/* Mobile user info and sync controls */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <SyncStatus />
                {isConnected && <SyncButton />}
                <button
                  onClick={handleLogout}
                  className="flex items-center px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Salir
                </button>
              </div>
            </div>
            
            <nav className="flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg flex items-center space-x-2 transition-all ${
                    location.pathname === item.path
                      ? 'bg-amber-800 font-medium'
                      : 'hover:bg-amber-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
      
      {/* Connection status banner */}
      {!isConnected && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
          <div className="container mx-auto">
            <p className="text-yellow-800 text-sm text-center">
              ⚠️ Trabajando en modo local. Los datos no se sincronizan entre dispositivos.
              {isLoading && " Intentando conectar..."}
            </p>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="bg-blue-100 border-b border-blue-200 px-4 py-2">
          <div className="container mx-auto">
            <p className="text-blue-800 text-sm text-center">
              🔄 Cargando datos...
            </p>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-amber-800 text-amber-100 py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Controlador Roskuki</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;