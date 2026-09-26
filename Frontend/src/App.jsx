import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { ROLES } from './constants/roles';
import { useAuth } from './context/AuthContext';

// Layout
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DemoStepper from './components/layout/DemoStepper';
import StaffSidebar from './components/layout/StaffSidebar';

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
import StaffOperationsHubPage from './pages/staff/StaffOperationsHubPage';
import StaffReceiptsPage from './pages/staff/StaffReceiptsPage';
import StaffDeliveriesPage from './pages/staff/StaffDeliveriesPage';
import StaffTransfersPage from './pages/staff/StaffTransfersPage';
import StaffStockCountPage from './pages/staff/StaffStockCountPage';
import StaffProfilePage from './pages/staff/StaffProfilePage';

/**
 * Read which panel is active from the URL path or hash.
 * /staff or #/staff => 'staff'
 * /manager or #/manager (or default) => 'manager'
 */
function getPanelFromUrl() {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path.includes('/staff') || hash.includes('staff')) {
    return 'staff';
  }
  return 'manager';
}

// =========================================================================
// INVENTORY MANAGER PANEL
// =========================================================================
function ManagerPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { resetAllData } = useInventory();
  const { switchRole } = useAuth();

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

  // Sync role to INVENTORY_MANAGER when this panel is active
  useEffect(() => {
    switchRole(ROLES.INVENTORY_MANAGER);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden', backgroundColor: 'var(--ss-bg-app)' }}>
      <Header onResetData={handleResetData} isStaffPanel={false} onNavigateTab={setActiveTab} />
      <DemoStepper
        currentStep={getStepNumberForTab(activeTab)}
        onStepClick={(tab) => setActiveTab(tab)}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        <main style={{ flex: 1, overflowY: 'auto', minHeight: 0, backgroundColor: 'var(--ss-bg-app)' }}>
          {activeTab === 'dashboard' && <InventoryManagerDashboard onNavigateTab={setActiveTab} />}
          {activeTab === 'products' && <ProductsPage onQuickReceive={() => setActiveTab('receipts')} onQuickTransfer={() => setActiveTab('transfers')} />}
          {activeTab === 'receipts' && <ReceiptsPage onNavigateTab={setActiveTab} />}
          {activeTab === 'transfers' && <TransfersPage onNavigateTab={setActiveTab} />}
          {activeTab === 'deliveries' && <DeliveriesPage />}
          {activeTab === 'adjustments' && <AdjustmentsPage />}
          {activeTab === 'ledger' && <StockLedgerPage />}
          {activeTab === 'reports' && <ReportsPage onNavigateTab={setActiveTab} />}
          {(activeTab === 'warehouse' || activeTab === 'warehouses') && <WarehousePage />}
          {activeTab === 'settings' && <SettingsPage onResetData={handleResetData} />}
          {activeTab === 'users' && <SettingsPage onResetData={handleResetData} />}
        </main>
      </div>
    </div>
  );
}

// =========================================================================
// WAREHOUSE STAFF PANEL
// =========================================================================
function StaffPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { resetAllData } = useInventory();
  const { switchRole } = useAuth();

  const handleResetData = () => {
    resetAllData();
    setActiveTab('dashboard');
  };

  // Sync role to WAREHOUSE_STAFF when this panel is active
  useEffect(() => {
    switchRole(ROLES.WAREHOUSE_STAFF);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden', backgroundColor: 'var(--ss-bg-app)' }}>
      <Header onResetData={handleResetData} isStaffPanel={true} onNavigateTab={setActiveTab} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <StaffSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        <main style={{ flex: 1, overflowY: 'auto', minHeight: 0, backgroundColor: 'var(--ss-bg-app)' }}>
          {activeTab === 'dashboard' && <StaffDashboard onNavigateTab={setActiveTab} />}
          {activeTab === 'tasks' && <StaffTasksPage onNavigateTab={setActiveTab} />}
          {activeTab === 'operations-hub' && <StaffOperationsHubPage onNavigateTab={setActiveTab} />}
          {activeTab === 'receipts' && <StaffReceiptsPage />}
          {activeTab === 'deliveries' && <StaffDeliveriesPage />}
          {activeTab === 'transfers' && <StaffTransfersPage />}
          {activeTab === 'stock-counting' && <StaffStockCountPage />}
          {activeTab === 'profile' && <StaffProfilePage />}
        </main>
      </div>
    </div>
  );
}

// =========================================================================
// ROOT ROUTER — hash-based, NO LOGIN REQUIRED
// =========================================================================
function RootApp() {
  const [currentPanel, setCurrentPanel] = useState(getPanelFromUrl);

  // Listen for URL changes (both hash and pathname history)
  useEffect(() => {
    const handleUrlChange = () => setCurrentPanel(getPanelFromUrl());
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  if (currentPanel === 'staff') {
    return <StaffPanel />;
  }

  return <ManagerPanel />;
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
