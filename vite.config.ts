// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 👇 base en la RAÍZ del objeto de configuración
  base: '/roskukiManage/',
});
