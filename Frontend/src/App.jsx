import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { ROLES } from './constants/roles';

// Layout & Global Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DemoStepper from './components/layout/DemoStepper';
import StaffSidebar from './components/layout/StaffSidebar';

// Auth View
import AuthPage from './pages/auth/AuthPage';

// Manager Pages
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

// Warehouse Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffTasksPage from './pages/staff/StaffTasksPage';
import StaffReceiptsPage from './pages/staff/StaffReceiptsPage';
import StaffDeliveriesPage from './pages/staff/StaffDeliveriesPage';
import StaffTransfersPage from './pages/staff/StaffTransfersPage';
import StaffStockCountPage from './pages/staff/StaffStockCountPage';
import StaffProfilePage from './pages/staff/StaffProfilePage';

/**
 * Inventory Manager Experience (Governance, Master Catalog, Ledgers & Strategy)
 */
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
            <ReceiptsPage onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'transfers' && (
            <TransfersPage onNavigateTab={setActiveTab} />
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

/**
 * Warehouse Staff Experience (Floor Execution, Fast Actions, Speed & Error Prevention)
 */
function StaffAppShell() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { resetAllData } = useInventory();

  const handleResetData = () => {
    resetAllData();
    setActiveTab('dashboard');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--ss-bg-app)' }}>
      {/* Global Mission-Control Header */}
      <Header onResetData={handleResetData} />

      {/* Main Floor Body with StaffSidebar & Operational Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <StaffSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--ss-bg-app)' }}>
          {activeTab === 'dashboard' && (
            <StaffDashboard onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'tasks' && (
            <StaffTasksPage onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'receipts' && (
            <StaffReceiptsPage />
          )}

          {activeTab === 'deliveries' && (
            <StaffDeliveriesPage />
          )}

          {activeTab === 'transfers' && (
            <StaffTransfersPage />
          )}

          {activeTab === 'stock-counting' && (
            <StaffStockCountPage />
          )}

          {activeTab === 'profile' && (
            <StaffProfilePage />
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * Root Controller: Auth Gating & Role-Based Panel Rendering
 */
function RootApp() {
  const { user, role } = useAuth();

  // If not logged in, show Auth Screen (First view Register, Second view Login)
  if (!user) {
    return <AuthPage />;
  }

  // If logged in as Warehouse Staff, render dedicated Warehouse Staff Panel
  if (role === ROLES.WAREHOUSE_STAFF) {
    return <StaffAppShell />;
  }

  // Default: Inventory Manager Panel
  return <MainAppShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <RootApp />
      </InventoryProvider>
    </AuthProvider>
  );
}
