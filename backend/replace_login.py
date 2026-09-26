import re

with open('Frontend/src/pages/auth/AuthPage.jsx', 'r') as f:
    content = f.read()

old_login = r"  const handleLogin = async \(e\) => \{.*?doSession\(\{ \.\.\.found, lastActive: 'Just now' \}\);\n  \};"

new_login = """  const handleLogin = async (e) => {
    e.preventDefault();
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail || !password) { toast$('Please enter your email and password.', 'error'); return; }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimEmail, password })
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast$('Invalid email or password.', 'error');
        } else {
          toast$('An error occurred while logging in.', 'error');
        }
        setLoading(false);
        return;
      }

      const userData = await response.json();
      
      const sessionUser = {
        id: `op-${userData.id}`,
        name: userData.name,
        email: userData.email,
        role: userData.role === 'ADMIN' ? ROLES.ADMIN : userData.role === 'MANAGER' ? ROLES.INVENTORY_MANAGER : ROLES.WAREHOUSE_STAFF,
        status: userData.status,
        avatar: userData.name.substring(0, 2).toUpperCase(),
        facility: userData.role === 'ADMIN' ? 'Global Operations HQ' : 'WH-01 Main DC (San Francisco)'
      };
      
      toast$(`Welcome back, ${sessionUser.name}!`, 'success');
      setLoading(false);
      doSession(sessionUser);
    } catch (error) {
      console.error(error);
      toast$('Network error. Make sure the backend is running.', 'error');
      setLoading(false);
    }
  };"""

content = re.sub(old_login, new_login, content, flags=re.DOTALL)

with open('Frontend/src/pages/auth/AuthPage.jsx', 'w') as f:
    f.write(content)

