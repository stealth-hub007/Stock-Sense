import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Clear stale mock data so the real backend data is always shown
const MOCK_KEYS = [
  'stocksense_products_v1', 'stocksense_ledger_v1', 'stocksense_receipts_v1',
  'stocksense_transfers_v1', 'stocksense_deliveries_v1', 'stocksense_adjustments_v1',
];
MOCK_KEYS.forEach(k => localStorage.removeItem(k));

import { AuthProvider } from './context/AuthContext';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { ROLES } from './constants/roles';
import { useAuth } from './context/AuthContext';

// Layout
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DemoStepper from './components/layout/DemoStepper';
import StaffSidebar from './components/layout/StaffSidebar';
import AdminSidebar from './components/layout/AdminSidebar';

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

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminWarehousesPage from './pages/admin/AdminWarehousesPage';
import AdminLocationsPage from './pages/admin/AdminLocationsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminUnitsPage from './pages/admin/AdminUnitsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

/**
 * Read which panel is active from the URL path or hash.
 * /staff or #/staff => 'staff'
 * /admin or #/admin => 'admin'
 * /manager or #/manager (or default) => 'manager'
 */
function getPanelFromUrl() {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path.includes('/staff') || hash.includes('staff')) {
    return 'staff';
  }
  if (path.includes('/admin') || hash.includes('admin')) {
    return 'admin';
  }
  return 'manager';
}

// =========================================================================
// INVENTORY MANAGER PANEL
// =========================================================================
function ManagerPanel() {
  const { resetAllData } = useInventory();
  const { switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleResetData = () => {
    resetAllData();
    navigate('/');
  };

  const getStepNumberForTab = (path) => {
    if (path.includes('receipts')) return 1;
    if (path.includes('transfers')) return 2;
    if (path.includes('deliveries')) return 3;
    if (path.includes('adjustments')) return 4;
    if (path.includes('ledger')) return 5;
    return 1;
  };

  // Sync role to INVENTORY_MANAGER when this panel is active
  useEffect(() => {
    switchRole(ROLES.INVENTORY_MANAGER);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden', backgroundColor: 'var(--ss-bg-app)' }}>
<Header onResetData={handleResetData} isStaffPanel={false} isAdminPanel={false} onNavigateTab={(tab) => navigate(`/${tab}`)} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <Sidebar activeTab={location.pathname.replace('/', '') || 'dashboard'} onSelectTab={(tab) => navigate(`/${tab === 'dashboard' ? '' : tab}`)} />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <DemoStepper
            currentStep={getStepNumberForTab(location.pathname)}
            onStepClick={(tab) => navigate(`/${tab}`)}
          />
          <main style={{ flex: 1, overflowY: 'auto', minHeight: 0, backgroundColor: 'var(--ss-bg-app)' }}>
            <Routes>
              <Route path="/" element={<InventoryManagerDashboard onNavigateTab={(tab) => navigate(`/${tab}`)} />} />
              <Route path="/products" element={<ProductsPage onQuickReceive={() => navigate('/receipts')} onQuickTransfer={() => navigate('/transfers')} />} />
              <Route path="/receipts" element={<ReceiptsPage onNavigateTab={(tab) => navigate(`/${tab}`)} />} />
              <Route path="/transfers" element={<TransfersPage onNavigateTab={(tab) => navigate(`/${tab}`)} />} />
              <Route path="/deliveries" element={<DeliveriesPage />} />
              <Route path="/adjustments" element={<AdjustmentsPage />} />
              <Route path="/ledger" element={<StockLedgerPage />} />
              <Route path="/reports" element={<ReportsPage onNavigateTab={(tab) => navigate(`/${tab}`)} />} />
              <Route path="/warehouse" element={<WarehousePage />} />
              <Route path="/warehouses" element={<WarehousePage />} />
              <Route path="/settings" element={<SettingsPage onResetData={handleResetData} />} />
              <Route path="/users" element={<SettingsPage onResetData={handleResetData} />} />
            </Routes>
          </main>
        </div>
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
      <Header onResetData={handleResetData} isStaffPanel={true} isAdminPanel={false} onNavigateTab={setActiveTab} />
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
// ADMINISTRATOR PANEL (PHASE 17 & 18)
// =========================================================================
function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { resetAllData } = useInventory();
  const { switchRole } = useAuth();

  const handleResetData = () => {
    resetAllData();
    setActiveTab('dashboard');
  };

  // Sync role to ADMIN when this panel is active
  useEffect(() => {
    switchRole(ROLES.ADMIN);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden', backgroundColor: 'var(--ss-bg-app)' }}>
      <Header onResetData={handleResetData} isStaffPanel={false} isAdminPanel={true} onNavigateTab={setActiveTab} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        <main style={{ flex: 1, overflowY: 'auto', minHeight: 0, backgroundColor: 'var(--ss-bg-app)' }}>
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} />}
          {activeTab === 'users' && <AdminUsersPage />}
          {activeTab === 'roles' && <AdminRolesPage />}
          {activeTab === 'warehouses' && <AdminWarehousesPage />}
          {activeTab === 'locations' && <AdminLocationsPage />}
          {activeTab === 'categories' && <AdminCategoriesPage />}
          {activeTab === 'units' && <AdminUnitsPage />}
          {activeTab === 'settings' && <AdminSettingsPage onResetData={handleResetData} />}
          {activeTab === 'profile' && <AdminProfilePage />}
        </main>
      </div>
    </div>
  );
}

// =========================================================================
// ROOT ROUTER — hash-based & path-based, NO LOGIN REQUIRED
// =========================================================================
function RootApp() {
  const [currentPanel, setCurrentPanel] = useState(getPanelFromUrl);

  // Listen for URL changes
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

if (currentPanel === 'admin') {
    return <AdminPanel />;
  }

  return (
    <BrowserRouter>
      <ManagerPanel />
    </BrowserRouter>
  );
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

