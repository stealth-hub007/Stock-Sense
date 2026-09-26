import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';

export const ReportsPage = ({ onNavigateTab }) => {
  const { products, ledger, metrics, triggerReorderPO, activeWarehouse, warehouses } = useInventory();
  const [activeReportTab, setActiveReportTab] = useState('ALERTS'); // 'ALERTS' | 'VALUATION' | 'MOVEMENT'
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // 1. Filter low stock and out-of-stock items needing attention
  const alertProducts = products.filter(
    (p) => p.onHand <= (p.reorderRule?.reorderPoint || p.minThreshold) || p.status !== 'IN_STOCK'
  );

  const handleQuickReorder = (sku) => {
    const prod = products.find((p) => p.sku === sku);
    if (!prod) return;
    const qty = prod.reorderRule?.maxStock ? Math.max(10, prod.reorderRule.maxStock - prod.onHand) : 50;
    triggerReorderPO(sku, qty);
    showToast(`✓ Inbound PO Receipt generated for +${qty} units of ${sku}! Check Inbound Receipts queue.`);
  };

  // 2. Valuation calculation by Category
  const categoryValuation = products.reduce((acc, p) => {
    const cat = p.category || 'General';
    const val = (p.onHand || 0) * (p.unitCost || 0);
    acc[cat] = (acc[cat] || 0) + val;
    return acc;
  }, {});

  const categoryEntries = Object.entries(categoryValuation).sort((a, b) => b[1] - a[1]);
  const totalValuation = Object.values(categoryValuation).reduce((acc, v) => acc + v, 0);

  // 3. Movement statistics
  const receiptCount = ledger.filter((l) => l.type === 'RECEIPT').length;
  const deliveryCount = ledger.filter((l) => l.type === 'DELIVERY').length;
  const transferCount = ledger.filter((l) => l.type === 'TRANSFER').length;
  const adjustmentCount = ledger.filter((l) => l.type === 'ADJUSTMENT').length;

  const handleExportReportCSV = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'UOM', 'On Hand', 'Min Threshold', 'Reorder Point', 'Max Capacity', 'Unit Cost', 'Total Value'];
    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name}"`,
      `"${p.category}"`,
      `"${p.uom || 'Units'}"`,
      p.onHand,
      p.minThreshold,
      p.reorderRule?.reorderPoint || p.minThreshold,
      p.reorderRule?.maxStock || 200,
      p.unitCost,
      (p.onHand * p.unitCost).toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stocksense_inventory_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✓ Comprehensive Stock Report exported to CSV.');
  };

  return (
    <div style={{ padding: 'var(--ss-space-6)', maxWidth: '1680px', margin: '0 auto', width: '100%' }}>
      {/* Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            background: 'var(--ss-bg-surface-elevated)',
            border: '1px solid var(--ss-primary)',
            borderRadius: 'var(--ss-radius-md)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--ss-shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--ss-text-primary)',
          }}
        >
          <span style={{ color: 'var(--ss-primary)', fontSize: '1.25rem' }}>⚡</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-primary)' }}>
              Automated Reorder Engine
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              {toastMsg}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 'var(--ss-space-5)',
          flexWrap: 'wrap',
          gap: 'var(--ss-space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--ss-text-primary)', letterSpacing: '-0.025em' }}>
              Reports & Reorder Intelligence
            </h1>
            <span className="ss-badge ss-badge-warning">NOTIFICATION ENGINE</span>
            <span className="ss-badge ss-badge-info">{activeWarehouse?.name || 'Main DC'}</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            Real-time low stock replenishment alerts, asset valuation analysis, and supply chain movement velocity.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="ss-btn ss-btn-secondary"
            onClick={handleExportReportCSV}
          >
            ⬇ Export Stock Report (CSV)
          </button>
        </div>
      </div>

      {/* Top 4 Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--ss-space-4)',
          marginBottom: 'var(--ss-space-5)',
        }}
      >
        <div className="ss-card" style={{ borderLeft: '4px solid var(--ss-warning)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>ACTIVE REORDER ALERTS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-warning-text)' }}>
            {alertProducts.length} <span style={{ fontSize: '0.875rem', color: 'var(--ss-text-muted)' }}>SKUs flagged</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '0.25rem' }}>
            {metrics.criticalOutCount} Critical Out of Stock • {metrics.lowStockCount} Low
          </div>
        </div>

        <div className="ss-card" style={{ borderLeft: '4px solid var(--ss-success)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>TOTAL ASSET VALUATION</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
            ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-success)', marginTop: '0.25rem' }}>
            Across {products.length} SKU catalog lines
          </div>
        </div>

        <div className="ss-card" style={{ borderLeft: '4px solid var(--ss-info)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>LEDGER AUDIT VOLUME</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-info-text)' }}>
            {ledger.length} <span style={{ fontSize: '0.875rem', color: 'var(--ss-text-muted)' }}>movements</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '0.25rem' }}>
            {receiptCount} Receipts • {deliveryCount} Dispatches • {transferCount} Transfers
          </div>
        </div>

        <div className="ss-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--ss-text-muted)' }}>OPERATING FACILITIES</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: '#c084fc' }}>
            {warehouses?.length || 3} <span style={{ fontSize: '0.875rem', color: 'var(--ss-text-muted)' }}>Warehouses</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', marginTop: '0.25rem' }}>
            Active: {activeWarehouse?.code || 'WH-01'} ({activeWarehouse?.city || 'San Francisco'})
          </div>
        </div>
      </div>

      {/* Report Section Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--ss-border)',
          marginBottom: 'var(--ss-space-5)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveReportTab('ALERTS')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeReportTab === 'ALERTS' ? '2px solid var(--ss-warning)' : '2px solid transparent',
            color: activeReportTab === 'ALERTS' ? 'var(--ss-warning-text)' : 'var(--ss-text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          ⚠️ Low Stock & Reorder Alerts ({alertProducts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('VALUATION')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeReportTab === 'VALUATION' ? '2px solid var(--ss-primary)' : '2px solid transparent',
            color: activeReportTab === 'VALUATION' ? 'var(--ss-primary)' : 'var(--ss-text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          📊 Stock Valuation & Categories
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('MOVEMENT')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeReportTab === 'MOVEMENT' ? '2px solid #8b5cf6' : '2px solid transparent',
            color: activeReportTab === 'MOVEMENT' ? '#c084fc' : 'var(--ss-text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          📈 Movement Velocity & Throughput
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: LOW STOCK & REORDER ALERTS                              */}
      {/* ------------------------------------------------------------- */}
      {activeReportTab === 'ALERTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ss-space-4)' }}>
          <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--ss-border)', background: 'var(--ss-bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                  Active Replenishment Alert Workbench
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                  SKUs breaching minimum safety buffer or reorder point thresholds requiring procurement PO action.
                </p>
              </div>
              <span className="ss-badge ss-badge-warning">{alertProducts.length} Action Items</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: 'var(--ss-bg-surface-elevated)', borderBottom: '1px solid var(--ss-border)' }}>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)' }}>SEVERITY</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)' }}>SKU & NAME</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)' }}>CATEGORY</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', textAlign: 'right' }}>ON HAND</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', textAlign: 'right' }}>REORDER POINT</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', textAlign: 'right' }}>TARGET CEILING</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', textAlign: 'right' }}>SUGGESTED PO</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--ss-text-muted)', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {alertProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--ss-text-muted)' }}>
                        ✓ All catalog items are above reorder thresholds. Inventory health is 100% optimal!
                      </td>
                    </tr>
                  ) : (
                    alertProducts.map((p) => {
                      const isOut = p.onHand === 0;
                      const suggested = Math.max(15, (p.reorderRule?.maxStock || 150) - p.onHand);

                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: '1px solid var(--ss-border-subtle)',
                            background: isOut ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {isOut ? (
                              <span className="ss-badge ss-badge-danger">CRITICAL ZERO</span>
                            ) : (
                              <span className="ss-badge ss-badge-warning">LOW STOCK</span>
                            )}
                          </td>

                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                              {p.sku}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                              {p.name}
                            </div>
                          </td>

                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span className="ss-badge ss-badge-neutral">{p.category}</span>
                          </td>

                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', fontWeight: 700, color: isOut ? 'var(--ss-danger-text)' : 'var(--ss-warning-text)' }}>
                            {p.onHand} {p.uom || 'units'}
                          </td>

                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)' }}>
                            {p.reorderRule?.reorderPoint || p.minThreshold}
                          </td>

                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-muted)' }}>
                            {p.reorderRule?.maxStock || 200}
                          </td>

                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontFamily: 'var(--ss-font-mono)', fontWeight: 700, color: 'var(--ss-primary)' }}>
                            +{suggested} {p.uom || 'units'}
                          </td>

                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="ss-btn ss-btn-primary"
                              onClick={() => handleQuickReorder(p.sku)}
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                            >
                              ⚡ + Create PO
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: STOCK VALUATION & CATEGORY BREAKDOWN                     */}
      {/* ------------------------------------------------------------- */}
      {activeReportTab === 'VALUATION' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 'var(--ss-space-5)' }}>
          {/* Category Distribution Table */}
          <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--ss-border)', background: 'var(--ss-bg-app)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                Asset Valuation by Product Category
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                Capital allocation across active mechanical, electrical, and sensor inventories.
              </p>
            </div>

            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {categoryEntries.map(([cat, val]) => {
                const pct = totalValuation > 0 ? ((val / totalValuation) * 100).toFixed(1) : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--ss-text-primary)' }}>{cat}</span>
                      <span style={{ fontFamily: 'var(--ss-font-mono)', fontWeight: 700 }}>
                        ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'var(--ss-bg-surface-elevated)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, var(--ss-primary) 0%, #8b5cf6 100%)',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Valued Items */}
          <div className="ss-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ss-text-primary)', marginBottom: '0.5rem' }}>
              Highest Capital Exposure SKUs
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: '1rem' }}>
              Products representing greatest balance sheet inventory commitment.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[...products]
                .sort((a, b) => b.onHand * b.unitCost - a.onHand * a.unitCost)
                .slice(0, 5)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--ss-radius-md)',
                      background: 'var(--ss-bg-app)',
                      border: '1px solid var(--ss-border)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ss-text-muted)' }}>#{idx + 1}</span>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>{p.sku}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>{p.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success)' }}>
                        ${(p.onHand * p.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                        {p.onHand} {p.uom || 'units'} @ ${p.unitCost}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: MOVEMENT VELOCITY & AUDIT DISTRIBUTION                  */}
      {/* ------------------------------------------------------------- */}
      {activeReportTab === 'MOVEMENT' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--ss-space-5)' }}>
          <div className="ss-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ss-text-primary)', marginBottom: '0.5rem' }}>
              Ledger Operation Distribution
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: '1rem' }}>
              Relative proportion of inventory state transitions registered in the engine.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--ss-radius-md)', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--ss-success)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--ss-success)' }}>
                  <span>Inbound Receipts (+)</span>
                  <span>{receiptCount} Operations</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.25rem' }}>
                  Supplier arrivals verified, inspected, and put into warehouse bins.
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: 'var(--ss-radius-md)', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--ss-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--ss-primary)' }}>
                  <span>Customer Deliveries (-)</span>
                  <span>{deliveryCount} Operations</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.25rem' }}>
                  Outbound sales orders picked, packed, and signed over to freight carriers.
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: 'var(--ss-radius-md)', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid #8b5cf6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.8125rem', color: '#c084fc' }}>
                  <span>Internal Transfers (⇄)</span>
                  <span>{transferCount} Operations</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.25rem' }}>
                  Inter-bin relocations and buffer replenishment (total stock unchanged).
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: 'var(--ss-radius-md)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--ss-warning)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--ss-warning-text)' }}>
                  <span>Cycle Count Adjustments (Δ)</span>
                  <span>{adjustmentCount} Operations</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '0.25rem' }}>
                  Physical audits reconciling system records with real-world shelf counts.
                </div>
              </div>
            </div>
          </div>

          <div className="ss-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ss-text-primary)', marginBottom: '0.5rem' }}>
              Supply Chain Pipeline Velocity
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: '1rem' }}>
              Flow balance between incoming vendor supply and outbound customer demand.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span>Pending Inbound Inflow</span>
                  <span style={{ fontWeight: 700, color: 'var(--ss-success)' }}>+{metrics.inboundUnitsPending} units</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--ss-bg-surface-elevated)' }}>
                  <div style={{ height: '100%', width: '65%', background: 'var(--ss-success)', borderRadius: '3px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span>Committed Outbound Allocation</span>
                  <span style={{ fontWeight: 700, color: 'var(--ss-danger)' }}>-{metrics.outboundUnitsPending} units</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--ss-bg-surface-elevated)' }}>
                  <div style={{ height: '100%', width: '48%', background: 'var(--ss-danger)', borderRadius: '3px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span>Fulfillment SLA Rating</span>
                  <span style={{ fontWeight: 700, color: 'var(--ss-primary)' }}>{metrics.dailyFulfillmentSlaPct}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'var(--ss-bg-surface-elevated)' }}>
                  <div style={{ height: '100%', width: `${metrics.dailyFulfillmentSlaPct}%`, background: 'var(--ss-primary)', borderRadius: '3px' }} />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--ss-bg-app)', borderRadius: 'var(--ss-radius-md)', border: '1px solid var(--ss-border)', fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
                💡 <strong>Replenishment Tip:</strong> With inbound volume exceeding outbound demand by {Math.max(0, metrics.inboundUnitsPending - metrics.outboundUnitsPending)} units, net warehouse stock is accumulating at healthy safety margins.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
