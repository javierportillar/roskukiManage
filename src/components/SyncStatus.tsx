import React from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { Cloud, CloudOff, Wifi, WifiOff } from 'lucide-react';

const SyncStatus: React.FC = () => {
  const { isConnected } = useSupabase();

  return (
    <div className={`flex items-center px-3 py-1 rounded-full text-xs ${
      isConnected 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {isConnected ? (
        <>
          <Cloud className="h-3 w-3 mr-1" />
          Sincronizado
        </>
      ) : (
        <>
          <CloudOff className="h-3 w-3 mr-1" />
          Solo local
        </>
      )}
    </div>
  );
};

export default SyncStatus;