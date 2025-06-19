import React from 'react';
import BackupManager from '../components/BackupManager';

const BackupPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-amber-900 mb-6">Exportación de Datos</h1>
      
      <div className="space-y-6">
        <BackupManager />
      </div>
    </div>
  );
};

export default BackupPage;