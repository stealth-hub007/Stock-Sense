import re

with open('Frontend/src/App.jsx', 'r') as f:
    content = f.read()

# Resolve 1st conflict (ManagerPanel switchRole import)
content = re.sub(
    r'<<<<<<< HEAD\n\s*const { switchRole } = useAuth\(\);\n\s*const navigate = useNavigate\(\);\n\s*const location = useLocation\(\);\n=======\n>>>>>>> origin/Frontend',
    '  const { switchRole } = useAuth();\n  const navigate = useNavigate();\n  const location = useLocation();',
    content
)

# Resolve 2nd conflict (ManagerPanel useEffect)
content = re.sub(
    r'<<<<<<< HEAD\n\s*// Remove forced sync to allow Manager to visit Staff panel\n\s*useEffect\(\(\) => {\n\s*// switchRole\(ROLES\.INVENTORY_MANAGER\);\n\s*}, \[\]\);\n\n=======\n>>>>>>> origin/Frontend',
    '  // Remove forced sync to allow Manager to visit Staff panel\n  useEffect(() => {\n    // switchRole(ROLES.INVENTORY_MANAGER);\n  }, []);\n',
    content
)

# Resolve 3rd conflict (StaffPanel useEffect)
content = re.sub(
    r'<<<<<<< HEAD\n\s*// Remove forced sync to allow Manager to visit Staff panel\n\s*useEffect\(\(\) => {\n\s*// switchRole\(ROLES\.WAREHOUSE_STAFF\);\n\s*}, \[\]\);\n\n=======\n>>>>>>> origin/Frontend',
    '  // Remove forced sync to allow Manager to visit Staff panel\n  useEffect(() => {\n    // switchRole(ROLES.WAREHOUSE_STAFF);\n  }, []);\n',
    content
)

# Resolve 4th conflict (AdminPanel useEffect)
content = re.sub(
    r'<<<<<<< HEAD\n\s*// Remove forced sync to allow Manager to visit Staff panel\n\s*useEffect\(\(\) => {\n\s*// switchRole\(ROLES\.ADMIN\);\n\s*}, \[\]\);\n\n=======\n>>>>>>> origin/Frontend',
    '  // Remove forced sync to allow Manager to visit Staff panel\n  useEffect(() => {\n    // switchRole(ROLES.ADMIN);\n  }, []);\n',
    content
)

# Resolve 5th conflict (RootApp)
root_app_new = """
  const [currentPanel, setCurrentPanel] = useState(getPanelFromUrl);
  const { user, isAuthenticated, activePanel, role } = useAuth();

  // Show Login / Register when not authenticated
  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  const userRole = user?.assignedRole || user?.role || role;

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

  // Security Enforcement: Staff are locked to the Staff Floor
  if (userRole === ROLES.WAREHOUSE_STAFF) {
    if (currentPanel !== 'staff') {
      window.location.hash = '#/staff';
    }
    return <StaffPanel />;
  }

  if (currentPanel === 'staff') {
    return <StaffPanel />;
  }

  if (currentPanel === 'admin' || (activePanel === 'admin' && userRole === ROLES.ADMIN)) {
    return <AdminPanel />;
  }

  return (
    <BrowserRouter>
      <ManagerPanel />
    </BrowserRouter>
  );
"""
content = re.sub(
    r'<<<<<<< HEAD\n\s*const \[currentPanel.*?>>>>>>> origin/Frontend',
    root_app_new.strip(),
    content,
    flags=re.DOTALL
)

with open('Frontend/src/App.jsx', 'w') as f:
    f.write(content)

