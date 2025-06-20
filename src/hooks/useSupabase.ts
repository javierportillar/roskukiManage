import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Verificar conexión
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        setIsConnected(!error);
      } catch (error) {
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  return { supabase, isConnected };
};