import re

with open('Frontend/src/pages/auth/AuthPage.jsx', 'r') as f:
    content = f.read()

# I want to add some text above the email input
old_input = r'<div style={{ position: \'relative\' }}>\s*<input\s*type="email"\s*value=\{email\}\s*onChange=\{\(e\) => setEmail\(e.target.value\)\}\s*placeholder="name@company.com"\s*className="ap-input"\s*/>'

new_input = """<div style={{ marginBottom: '1rem', padding: '1rem', background: '#eef2ff', borderRadius: '10px', fontSize: '0.8rem', color: '#3730a3' }}>
              <strong>Demo Credentials:</strong><br />
              Admin: admin@stocksense.io / admin123<br />
              Manager: manager@stocksense.io / manager123<br />
              Staff: staff@stocksense.io / staff123
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="ap-input"
              />"""

content = re.sub(old_input, new_input, content, flags=re.DOTALL)

with open('Frontend/src/pages/auth/AuthPage.jsx', 'w') as f:
    f.write(content)

