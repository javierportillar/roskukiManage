import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import SalesPage from './pages/SalesPage';
import OrdersPage from './pages/OrdersPage';
import InventoryPage from './pages/InventoryPage';
import FinancialPage from './pages/FinancialPage';
import CustomersPage from './pages/CustomersPage';
import BackupPage from './pages/BackupPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/roskukiManage" element={<Navigate to="/ventas" replace />} />
            <Route path="/ventas" element={<SalesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/financial" element={<FinancialPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/backup" element={<BackupPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;