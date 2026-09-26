import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DemoStepper from './components/layout/DemoStepper';
import InventoryManagerDashboard from './pages/dashboard/InventoryManagerDashboard';
import ProductsPage from './pages/products/ProductsPage';
import ReceiptsPage from './pages/operations/ReceiptsPage';
import TransfersPage from './pages/operations/TransfersPage';
import DeliveriesPage from './pages/operations/DeliveriesPage';
import AdjustmentsPage from './pages/operations/AdjustmentsPage';
import StockLedgerPage from './pages/ledger/StockLedgerPage';
import WarehousePage from './pages/warehouse/WarehousePage';
import SettingsPage from './pages/settings/SettingsPage';

function MainAppShell() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [resetKey, setResetKey] = useState(0);

  const handleResetData = () => {
    localStorage.removeItem('stocksense_operator');
    setResetKey((prev) => prev + 1);
    setActiveTab('dashboard');
  };

  const getStepNumberForTab = (tab) => {
    switch (tab) {
      case 'receipts': return 1;
      case 'transfers': return 2;
      case 'deliveries': return 3;
      case 'adjustments': return 4;
      case 'ledger': return 5;
      default: return 1;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--ss-bg-app)' }}>
      {/* Global Mission-Control Header */}
      <Header onResetData={handleResetData} />

      {/* Demo Journey Stepper Banner */}
      <DemoStepper
        currentStep={getStepNumberForTab(activeTab)}
        onStepClick={(tab) => setActiveTab(tab)}
      />

      {/* Main App Body with Sidebar & Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--ss-bg-app)' }}>
          {activeTab === 'dashboard' && (
            <InventoryManagerDashboard key={resetKey} onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'products' && (
            <ProductsPage key={resetKey} onQuickReceive={() => setActiveTab('receipts')} onQuickTransfer={() => setActiveTab('transfers')} />
          )}

          {activeTab === 'receipts' && (
            <ReceiptsPage key={resetKey} />
          )}

          {activeTab === 'transfers' && (
            <TransfersPage key={resetKey} />
          )}

          {activeTab === 'deliveries' && (
            <DeliveriesPage key={resetKey} />
          )}

          {activeTab === 'adjustments' && (
            <AdjustmentsPage key={resetKey} />
          )}

          {activeTab === 'ledger' && (
            <StockLedgerPage key={resetKey} />
          )}

          {(activeTab === 'warehouse' || activeTab === 'warehouses') && (
            <WarehousePage key={resetKey} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage key={resetKey} onResetData={handleResetData} />
          )}

          {activeTab === 'users' && (
            <SettingsPage key={resetKey} onResetData={handleResetData} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppShell />
    </AuthProvider>
  );
}
