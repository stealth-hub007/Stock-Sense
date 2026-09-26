import re

with open('Frontend/src/components/layout/Header.jsx', 'r') as f:
    content = f.read()

# Resolve 1st conflict
content = re.sub(
    r'<<<<<<< HEAD\n\s*const badgeStyle = ROLE_BADGE_STYLES\[role\] \|\| ROLE_BADGE_STYLES\[ROLES\.INVENTORY_MANAGER\];\n\s*const isAdmin = role === ROLES\.ADMIN;\n\s*const isStaff = role === ROLES\.WAREHOUSE_STAFF;\n=======\n\s*const userRole = user\?\.assignedRole \|\| user\?\.role \|\| role;\n\s*const badgeStyle = ROLE_BADGE_STYLES\[userRole\] \|\| ROLE_BADGE_STYLES\[ROLES\.INVENTORY_MANAGER\];\n\s*const isAdmin = isAdminPanel \|\| userRole === ROLES\.ADMIN;\n\s*const isStaff = isStaffPanel \|\| userRole === ROLES\.WAREHOUSE_STAFF;\n>>>>>>> origin/Frontend',
    '  const userRole = user?.assignedRole || user?.role || role;\n  const badgeStyle = ROLE_BADGE_STYLES[userRole] || ROLE_BADGE_STYLES[ROLES.INVENTORY_MANAGER];\n  const isAdmin = userRole === ROLES.ADMIN;\n  const isStaff = userRole === ROLES.WAREHOUSE_STAFF;',
    content
)

# Resolve 2nd conflict (The entire block)
# Since the user told me to remove the panel switcher from the staff panel completely,
# I will use the code from HEAD which implements exactly that.
content = re.sub(
    r'<<<<<<< HEAD\n\s*\{\/\* Interactive Panel Switcher — STRICTLY HIDDEN ON STAFF FLOOR PANEL \*\/\}.*?>>>>>>> origin/Frontend',
    '''
        {/* Full Interactive Panel Switcher - Only on Manager/Admin Dashboards */}
        {!isStaff && !isStaffPanel && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.4rem',
              background: 'var(--ss-bg-app)',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-md)',
            }}
          >
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--ss-text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                paddingLeft: '0.25rem',
              }}
            >
              Panel:
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--ss-bg-surface)',
                border: '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-sm)',
                padding: '2px',
              }}
            >
              {/* Manager Panel */}
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#/manager';
                }}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--ss-radius-xs)',
                  border: 'none',
                  background: !isAdminPanel && !isStaffPanel ? 'var(--ss-primary)' : 'transparent',
                  color: !isAdminPanel && !isStaffPanel ? '#ffffff' : 'var(--ss-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                Manager
              </button>

              {/* Staff Floor Panel */}
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#/staff';
                }}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--ss-radius-xs)',
                  border: 'none',
                  background: isStaffPanel ? 'var(--ss-success)' : 'transparent',
                  color: isStaffPanel ? '#ffffff' : 'var(--ss-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                Staff Floor
              </button>

              {/* Admin Panel */}
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#/admin';
                }}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--ss-radius-xs)',
                  border: 'none',
                  background: isAdminPanel ? 'var(--ss-warning)' : 'transparent',
                  color: isAdminPanel ? '#000000' : 'var(--ss-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                Admin
              </button>
            </div>
          </div>
        )}
    '''.strip(),
    content,
    flags=re.DOTALL
)

with open('Frontend/src/components/layout/Header.jsx', 'w') as f:
    f.write(content)

