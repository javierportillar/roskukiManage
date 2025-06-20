import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CookieIcon, BarChart3, Package, ShoppingCart, Menu, X, Users, ClipboardList, Download } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/ventas', label: 'Ventas', icon: <ShoppingCart className="w-5 h-5" /> },
    { path: '/orders', label: 'Pedidos', icon: <ClipboardList className="w-5 h-5" /> },
    { path: '/inventory', label: 'Inventario', icon: <Package className="w-5 h-5" /> },
    { path: '/financial', label: 'Finanzas', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/customers', label: 'Clientes', icon: <Users className="w-5 h-5" /> },
    { path: '/backup', label: 'Exportar', icon: <Download className="w-5 h-5" /> },

  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-700 to-amber-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/ventas" className="flex items-center space-x-2 font-bold text-xl hover:text-amber-100 transition-colors">
            <CookieIcon className="h-8 w-8" />
            <span>Controlador Roskuki</span>
          </Link>
          
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
          <nav className="container mx-auto px-4 py-2 flex flex-col">
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