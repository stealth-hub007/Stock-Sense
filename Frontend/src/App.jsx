import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider, useInventory } from './context/InventoryContext';
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
import ReportsPage from './pages/reports/ReportsPage';

function MainAppShell() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { resetAllData } = useInventory();

  const handleResetData = () => {
    resetAllData();
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
            <InventoryManagerDashboard onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'products' && (
            <ProductsPage onQuickReceive={() => setActiveTab('receipts')} onQuickTransfer={() => setActiveTab('transfers')} />
          )}

          {activeTab === 'receipts' && (
            <ReceiptsPage />
          )}

          {activeTab === 'transfers' && (
            <TransfersPage />
          )}

          {activeTab === 'deliveries' && (
            <DeliveriesPage />
          )}

          {activeTab === 'adjustments' && (
            <AdjustmentsPage />
          )}

          {activeTab === 'ledger' && (
            <StockLedgerPage />
          )}

          {activeTab === 'reports' && (
            <ReportsPage onNavigateTab={setActiveTab} />
          )}

          {(activeTab === 'warehouse' || activeTab === 'warehouses') && (
            <WarehousePage />
          )}

          {activeTab === 'settings' && (
            <SettingsPage onResetData={handleResetData} />
          )}

          {activeTab === 'users' && (
            <SettingsPage onResetData={handleResetData} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <MainAppShell />
      </InventoryProvider>
    </AuthProvider>
  );
}
