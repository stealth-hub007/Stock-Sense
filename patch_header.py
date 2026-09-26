import re

with open('Frontend/src/components/layout/Header.jsx', 'r') as f:
    content = f.read()

# We need to change the condition on line 204
# Currently it's: `{!isStaff && (`
# We will replace it so that the main switcher is ONLY shown if NOT isStaffPanel and NOT isStaff.

full_switcher_replacement = """
        {/* Full Interactive Panel Switcher - Only on Manager/Admin Dashboards */}
        {!isStaff && !isStaffPanel && (
"""

content = content.replace("{!isStaff && (", full_switcher_replacement, 1)

# Now we need to insert the "Return to Manager/Admin" button if they ARE on the staff panel
# We'll insert it right after the closing brace of the full switcher.
# The full switcher ends right before `{/* Real-time Notification Bell`

return_button = """
        {/* Return Button - Only when Manager/Admin is visiting Staff Floor */}
        {!isStaff && isStaffPanel && (
          <button
            type="button"
            onClick={() => {
              window.location.hash = role === ROLES.ADMIN ? '#/admin' : '#/manager';
            }}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: 'var(--ss-radius-md)',
              border: '1px solid var(--ss-border)',
              background: 'var(--ss-bg-surface)',
              color: 'var(--ss-text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: 'var(--ss-shadow-sm)'
            }}
          >
            <span>←</span> Return to {role === ROLES.ADMIN ? 'Admin' : 'Manager'}
          </button>
        )}

        {/* Real-time Notification Bell
"""

content = content.replace("        {/* Real-time Notification Bell", return_button, 1)

with open('Frontend/src/components/layout/Header.jsx', 'w') as f:
    f.write(content)

