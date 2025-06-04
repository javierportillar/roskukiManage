import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import SalesPage from './pages/SalesPage';
import InventoryPage from './pages/InventoryPage';
import FinancialPage from './pages/FinancialPage';
import CustomersPage from './pages/CustomersPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<SalesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/financial" element={<FinancialPage />} />
            <Route path="/customers" element={<CustomersPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;