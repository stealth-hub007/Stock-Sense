import re

with open('Frontend/src/App.jsx', 'r') as f:
    content = f.read()

# Resolve first conflict (ManagerPanel Header)
content = re.sub(
    r'<<<<<<< HEAD\n\s*<Header onResetData={handleResetData} isStaffPanel={false} onNavigateTab={\(tab\) => navigate\(`/\${tab}`\)} />\n=======\n\s*<Header onResetData={handleResetData} isStaffPanel={false} isAdminPanel={false} onNavigateTab={setActiveTab} />\n\s*<DemoStepper\n\s*currentStep={getStepNumberForTab\(activeTab\)}\n\s*onStepClick={\(tab\) => setActiveTab\(tab\)}\n\s*/>\n>>>>>>> origin/Frontend',
    '<Header onResetData={handleResetData} isStaffPanel={false} isAdminPanel={false} onNavigateTab={(tab) => navigate(`/${tab}`)} />',
    content
)

# Resolve second conflict (AdminPanel)
admin_panel_str = """
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
"""
content = re.sub(
    r'<<<<<<< HEAD\n// ROOT ROUTER\n=======\n(.*?)>>>>>>> origin/Frontend',
    admin_panel_str.strip(),
    content,
    flags=re.DOTALL
)

# Resolve third conflict (RootApp return)
root_app_str = """
  if (currentPanel === 'admin') {
    return <AdminPanel />;
  }

  return (
    <BrowserRouter>
      <ManagerPanel />
    </BrowserRouter>
  );
"""
content = re.sub(
    r'<<<<<<< HEAD\n\s*return \(\n\s*<BrowserRouter>\n\s*<ManagerPanel />\n\s*</BrowserRouter>\n\s*\);\n=======\n\s*if \(currentPanel === \'admin\'\) {\n\s*return <AdminPanel />;\n\s*}\n\n\s*return <ManagerPanel />;\n>>>>>>> origin/Frontend',
    root_app_str.strip(),
    content
)

with open('Frontend/src/App.jsx', 'w') as f:
    f.write(content)

