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

// Authentication Pages
import AuthPage from './pages/auth/AuthPage';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const { resetAllData } = useInventory();
  const { switchRole, user } = useAuth();

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
    if (user?.role !== ROLES.ADMIN && user?.role !== ROLES.INVENTORY_MANAGER) {
      switchRole(ROLES.INVENTORY_MANAGER);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden', backgroundColor: 'var(--ss-bg-app)' }}>
      <Header onResetData={handleResetData} isStaffPanel={false} isAdminPanel={false} onNavigateTab={setActiveTab} />
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
  const { switchRole, user } = useAuth();

  const handleResetData = () => {
    resetAllData();
    setActiveTab('dashboard');
  };

  // Sync role to WAREHOUSE_STAFF when this panel is active
  useEffect(() => {
    if (user?.role !== ROLES.ADMIN && user?.role !== ROLES.WAREHOUSE_STAFF) {
      switchRole(ROLES.WAREHOUSE_STAFF);
    }
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
  const { switchRole, user } = useAuth();

  const handleResetData = () => {
    resetAllData();
    setActiveTab('dashboard');
  };

  // Sync role to ADMIN when this panel is active
  useEffect(() => {
    if (user?.role !== ROLES.ADMIN) {
      switchRole(ROLES.ADMIN);
    }
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
// ROOT ROUTER — AUTHENTICATED GATEWAY (DEFAULT INITIAL SCREEN: LOGIN)
// =========================================================================
function RootApp() {
  const { user, isAuthenticated } = useAuth();
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

  // When user signs in, sync panel to their role
  useEffect(() => {
    if (user?.role) {
      if (user.role === ROLES.ADMIN) {
        setCurrentPanel('admin');
        window.location.hash = '#/admin';
      } else if (user.role === ROLES.WAREHOUSE_STAFF) {
        setCurrentPanel('staff');
        window.location.hash = '#/staff';
      } else {
        setCurrentPanel('manager');
        window.location.hash = '#/manager';
      }
    }
  }, [user?.id, user?.role]);

  // FLOW REQUIREMENT: INITIAL SCREEN IS THE LOGIN/REGISTER PAGE
  if (!isAuthenticated || !user) {
    return (
      <AuthPage
        initialTab="LOGIN"
        onLoginSuccess={(loggedInUser) => {
          if (loggedInUser.role === ROLES.ADMIN) {
            setCurrentPanel('admin');
            window.location.hash = '#/admin';
          } else if (loggedInUser.role === ROLES.WAREHOUSE_STAFF) {
            setCurrentPanel('staff');
            window.location.hash = '#/staff';
          } else {
            setCurrentPanel('manager');
            window.location.hash = '#/manager';
          }
        }}
      />
    );
  }

  if (currentPanel === 'staff') {
    return <StaffPanel />;
  }

  if (currentPanel === 'admin') {
    return <AdminPanel />;
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

