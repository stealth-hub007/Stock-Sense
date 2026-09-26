import re

with open('Frontend/src/components/layout/Header.jsx', 'r') as f:
    content = f.read()

# Resolve 1st conflict
content = re.sub(
    r'<<<<<<< HEAD\n\s*const badgeStyle = ROLE_BADGE_STYLES\[role\] \|\| ROLE_BADGE_STYLES\[ROLES\.INVENTORY_MANAGER\];\n\s*const isAdmin = role === ROLES\.ADMIN;\n\s*const isStaff = role === ROLES\.WAREHOUSE_STAFF;\n=======\n\s*const userRole = user\?\.assignedRole \|\| user\?\.role \|\| role;\n\s*const badgeStyle = ROLE_BADGE_STYLES\[userRole\] \|\| ROLE_BADGE_STYLES\[ROLES\.INVENTORY_MANAGER\];\n\s*const isAdmin = isAdminPanel \|\| userRole === ROLES\.ADMIN;\n\s*const isStaff = isStaffPanel \|\| userRole === ROLES\.WAREHOUSE_STAFF;\n>>>>>>> origin/Frontend',
    '  const userRole = user?.assignedRole || user?.role || role;\n  const badgeStyle = ROLE_BADGE_STYLES[userRole] || ROLE_BADGE_STYLES[ROLES.INVENTORY_MANAGER];\n  const isAdmin = userRole === ROLES.ADMIN;\n  const isStaff = userRole === ROLES.WAREHOUSE_STAFF;',
    content
)

# Replace the entire switcher block with the correct code without markers
# To be safe, let's just find the markers and remove them.

content = re.sub(
    r'<<<<<<< HEAD\n\s*onClick=\{\(\) => \{\n\s*window\.location\.hash = \'#/manager\';\n\s*\}\}\n=======\n\s*onClick=\{\(\) => switchPanel\(\'manager\'\)\}\n>>>>>>> origin/Frontend',
    "                onClick={() => { window.location.hash = '#/manager'; }}",
    content
)

content = re.sub(
    r'<<<<<<< HEAD\n\s*onClick=\{\(\) => \{\n\s*window\.location\.hash = \'#/staff\';\n\s*\}\}\n=======\n\s*onClick=\{\(\) => switchPanel\(\'staff\'\)\}\n>>>>>>> origin/Frontend',
    "                onClick={() => { window.location.hash = '#/staff'; }}",
    content
)

content = re.sub(
    r'<<<<<<< HEAD\n\s*<button\n\s*type="button"\n\s*onClick=\{\(\) => \{\n\s*window\.location\.hash = \'#/admin\';\n\s*\}\}\n=======\n\s*\{\/\* Admin Panel — Visible ONLY to Admin \*\/\}\n\s*\{userRole === ROLES\.ADMIN && \(\n\s*<button\n\s*type="button"\n\s*onClick=\{\(\) => switchPanel\(\'admin\'\)\}\n>>>>>>> origin/Frontend',
    """
              <button
                type="button"
                onClick={() => { window.location.hash = '#/admin'; }}
    """,
    content
)

with open('Frontend/src/components/layout/Header.jsx', 'w') as f:
    f.write(content)

