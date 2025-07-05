import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: { username: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos
const SESSION_KEY = 'roskuki_session';
const SESSION_TIMESTAMP_KEY = 'roskuki_session_timestamp';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ username: string } | null>(null);

  // Verificar sesión existente al cargar
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Auto-logout cuando expire la sesión
  useEffect(() => {
    if (isAuthenticated) {
      const checkSessionExpiry = () => {
        const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
        if (timestamp) {
          const sessionTime = parseInt(timestamp);
          const currentTime = Date.now();
          
          if (currentTime - sessionTime > SESSION_DURATION) {
            console.log('🕐 Sesión expirada, cerrando automáticamente...');
            logout();
          }
        }
      };

      // Verificar cada minuto
      const interval = setInterval(checkSessionExpiry, 60000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const checkExistingSession = () => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
      
      if (session && timestamp) {
        const sessionTime = parseInt(timestamp);
        const currentTime = Date.now();
        
        // Verificar si la sesión no ha expirado
        if (currentTime - sessionTime < SESSION_DURATION) {
          const userData = JSON.parse(session);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ Sesión válida encontrada, usuario autenticado');
        } else {
          console.log('⏰ Sesión expirada, limpiando...');
          clearSession();
        }
      }
    } catch (error) {
      console.error('❌ Error al verificar sesión:', error);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simular delay de autenticación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Obtener credenciales de las variables de entorno
      const validUsername = import.meta.env.VITE_ADMIN_USERNAME;
      const validPassword = import.meta.env.VITE_ADMIN_PASSWORD;
      
      console.log('🔐 Verificando credenciales...');
      
      if (username === validUsername && password === validPassword) {
        const userData = { username };
        const currentTime = Date.now();
        
        // Guardar sesión
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        localStorage.setItem(SESSION_TIMESTAMP_KEY, currentTime.toString());
        
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('✅ Login exitoso, sesión iniciada');
        return true;
      } else {
        console.log('❌ Credenciales incorrectas');
        return false;
      }
    } catch (error) {
      console.error('❌ Error durante el login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    clearSession();
    setIsAuthenticated(false);
    setUser(null);
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};