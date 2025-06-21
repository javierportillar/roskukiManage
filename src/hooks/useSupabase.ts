import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar conexión
    const checkConnection = async () => {
      try {
        setIsLoading(true);

        // Intentar hacer una consulta simple para verificar la conexión
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1);

        if (error) {
          console.error('Error de conexión a Supabase:', error);
          setIsConnected(false);
        } else {
          console.log('Conectado a Supabase exitosamente');
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error al verificar conexión:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();

    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return { supabase, isConnected, isLoading };
};