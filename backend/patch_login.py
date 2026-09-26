import re

with open('Frontend/src/pages/auth/AuthPage.jsx', 'r') as f:
    content = f.read()

# We need to change the doSession part to also set the hash
old_code = r"      toast\$\(`Welcome back, \$\{sessionUser.name\}!`, 'success'\);\n      setLoading\(false\);\n      doSession\(sessionUser\);\n    \} catch"
new_code = """      toast$(`Welcome back, ${sessionUser.name}!`, 'success');
      setLoading(false);
      
      // Update the hash so the router displays the correct initial panel
      if (sessionUser.role === ROLES.ADMIN) {
        window.location.hash = '#/admin';
      } else if (sessionUser.role === ROLES.INVENTORY_MANAGER) {
        window.location.hash = '#/manager';
      } else {
        window.location.hash = '#/staff';
      }
      
      doSession(sessionUser);
    } catch"""

content = re.sub(old_code, new_code, content)

with open('Frontend/src/pages/auth/AuthPage.jsx', 'w') as f:
    f.write(content)

