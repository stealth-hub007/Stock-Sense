import re

with open('Frontend/src/components/layout/AdminSidebar.jsx', 'r') as f:
    sidebar = f.read()

operational_section = """
    {
      title: 'OPERATIONS & INVENTORY',
      items: [
        {
          id: 'products',
          label: 'Products Catalog',
          icon: '📦',
          badge: null,
        },
        {
          id: 'receipts',
          label: 'Inbound Receipts',
          icon: '📥',
          badge: null,
        },
        {
          id: 'deliveries',
          label: 'Delivery Orders',
          icon: '📤',
          badge: null,
        },
        {
          id: 'transfers',
          label: 'Internal Transfers',
          icon: '🔄',
          badge: null,
        },
        {
          id: 'adjustments',
          label: 'Stock Adjustments',
          icon: '⚖️',
          badge: null,
        },
        {
          id: 'ledger',
          label: 'Stock Ledger',
          icon: '📋',
          badge: null,
        },
        {
          id: 'reports',
          label: 'Reports & Analytics',
          icon: '📈',
          badge: null,
        },
      ],
    },
"""

sidebar = sidebar.replace("    {\n      title: 'MANAGEMENT',", operational_section + "\n    {\n      title: 'MANAGEMENT',")

with open('Frontend/src/components/layout/AdminSidebar.jsx', 'w') as f:
    f.write(sidebar)

with open('Frontend/src/App.jsx', 'r') as f:
    app = f.read()

operational_routes = """
          {activeTab === 'profile' && <AdminProfilePage />}
          {activeTab === 'products' && <ProductsPage />}
          {activeTab === 'receipts' && <ReceiptsPage />}
          {activeTab === 'deliveries' && <DeliveriesPage />}
          {activeTab === 'transfers' && <TransfersPage />}
          {activeTab === 'adjustments' && <AdjustmentsPage />}
          {activeTab === 'ledger' && <StockLedgerPage />}
          {activeTab === 'reports' && <ReportsPage />}
"""

app = app.replace("          {activeTab === 'profile' && <AdminProfilePage />}", operational_routes.strip())

with open('Frontend/src/App.jsx', 'w') as f:
    f.write(app)

