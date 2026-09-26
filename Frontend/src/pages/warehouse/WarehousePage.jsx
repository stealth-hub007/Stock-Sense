import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { INITIAL_ZONES, INITIAL_PRODUCTS } from '../../services/mockData';

// Realistic bin matrix generator for interactive warehouse racks
const GENERATE_BINS = (zoneId) => {
  if (zoneId === 'zone-a') {
    return [
      { id: 'A-01', aisle: 'Aisle 01', level: 'L1', sku: 'MTR-9002', name: 'Servo Motor', qty: 60, maxQty: 80, status: 'OCCUPIED' },
      { id: 'A-02', aisle: 'Aisle 01', level: 'L2', sku: 'MTR-9002', name: 'Servo Motor', qty: 40, maxQty: 80, status: 'OCCUPIED' },
      { id: 'A-03', aisle: 'Aisle 01', level: 'L3', sku: null, name: 'Vacant Bin', qty: 0, maxQty: 80, status: 'VACANT' },
      { id: 'A-04', aisle: 'Aisle 02', level: 'L1', sku: null, name: 'Vacant Bin', qty: 0, maxQty: 80, status: 'VACANT' },
      { id: 'A-05', aisle: 'Aisle 02', level: 'L2', sku: 'BEA-7204', name: 'Angular Bearing Set', qty: 90, maxQty: 100, status: 'OCCUPIED' },
      { id: 'A-06', aisle: 'Aisle 02', level: 'L3', sku: 'BEA-7204', name: 'Angular Bearing Set', qty: 90, maxQty: 100, status: 'OCCUPIED' },
      { id: 'A-07', aisle: 'Aisle 03', level: 'L1', sku: null, name: 'Vacant Bin', qty: 0, maxQty: 80, status: 'VACANT' },
      { id: 'A-08', aisle: 'Aisle 03', level: 'L2', sku: null, name: 'Reserved Inbound', qty: 0, maxQty: 80, status: 'RESERVED' },
      { id: 'A-09', aisle: 'Aisle 04', level: 'L1', sku: 'MTR-9002', name: 'Servo Motor Spare', qty: 20, maxQty: 80, status: 'LOW' },
      { id: 'A-10', aisle: 'Aisle 04', level: 'L2', sku: null, name: 'Vacant Bin', qty: 0, maxQty: 80, status: 'VACANT' },
      { id: 'A-11', aisle: 'Aisle 05', level: 'L1', sku: null, name: 'Vacant Bin', qty: 0, maxQty: 80, status: 'VACANT' },
      { id: 'A-12', aisle: 'Aisle 05', level: 'L2', sku: null, name: 'Vacant Bin', qty: 0, maxQty: 80, status: 'VACANT' },
    ];
  }
  if (zoneId === 'zone-b') {
    return [
      { id: 'B-01', aisle: 'Aisle 07', level: 'L1', sku: 'VLV-3011', name: 'Solenoid Valve', qty: 28, maxQty: 50, status: 'LOW' },
      { id: 'B-02', aisle: 'Aisle 07', level: 'L2', sku: 'PWR-2410', name: 'Power Supply 24V', qty: 45, maxQty: 50, status: 'OCCUPIED' },
      { id: 'B-03', aisle: 'Aisle 08', level: 'L1', sku: 'PWR-2410', name: 'Power Supply 24V', qty: 40, maxQty: 50, status: 'OCCUPIED' },
      { id: 'B-04', aisle: 'Aisle 08', level: 'L2', sku: null, name: 'Vacant Bin', qty: 0, maxQty: 50, status: 'VACANT' },
      { id: 'B-05', aisle: 'Aisle 09', level: 'L1', sku: null, name: 'Vacant Bin', qty: 0, maxQty: 50, status: 'VACANT' },
      { id: 'B-06', aisle: 'Aisle 09', level: 'L2', sku: null, name: 'Vacant Bin', qty: 0, maxQty: 50, status: 'VACANT' },
      { id: 'B-07', aisle: 'Aisle 10', level: 'L1', sku: null, name: 'Vacant Bin', qty: 0, maxQty: 50, status: 'VACANT' },
      { id: 'B-08', aisle: 'Aisle 10', level: 'L2', sku: null, name: 'Vacant Bin', qty: 0, maxQty: 50, status: 'VACANT' },
    ];
  }
  if (zoneId === 'zone-c') {
    return [
      { id: 'C-01', aisle: 'Staging 01', level: 'Floor', sku: 'MTR-9002', name: 'Servo Motor (Tesla)', qty: 10, maxQty: 20, status: 'OCCUPIED' },
      { id: 'C-02', aisle: 'Staging 01', level: 'Floor', sku: 'MTR-9002', name: 'Servo Motor (Buffer)', qty: 10, maxQty: 20, status: 'OCCUPIED' },
      { id: 'C-03', aisle: 'Staging 02', level: 'Floor', sku: 'SEN-1002', name: 'Laser Sensor (Boeing)', qty: 8, maxQty: 20, status: 'OCCUPIED' },
      { id: 'C-04', aisle: 'Staging 02', level: 'Floor', sku: null, name: 'Active Packing Tote', qty: 0, maxQty: 20, status: 'RESERVED' },
      { id: 'C-05', aisle: 'Staging 03', level: 'Floor', sku: null, name: 'Outbound Express Staging', qty: 0, maxQty: 20, status: 'VACANT' },
      { id: 'C-06', aisle: 'Staging 03', level: 'Floor', sku: null, name: 'Carrier Bay Loading', qty: 0, maxQty: 20, status: 'VACANT' },
    ];
  }
  if (zoneId === 'zone-v') {
    return [
      { id: 'V-01', aisle: 'Vault Chamber 1', level: 'Lockbox A', sku: 'PLC-5500', name: 'Modular PLC 32-I/O', qty: 64, maxQty: 75, status: 'OCCUPIED' },
      { id: 'V-02', aisle: 'Vault Chamber 1', level: 'Lockbox B', sku: 'HMI-1080', name: 'Touch Panel 10.4"', qty: 19, maxQty: 30, status: 'OCCUPIED' },
      { id: 'V-03', aisle: 'Vault Chamber 2', level: 'Lockbox C', sku: null, name: 'Secure Holding Bay', qty: 0, maxQty: 50, status: 'VACANT' },
      { id: 'V-04', aisle: 'Vault Chamber 2', level: 'Lockbox D', sku: null, name: 'High-Value Quarantine', qty: 0, maxQty: 50, status: 'VACANT' },
    ];
  }
  // zone-d default
  return [
    { id: 'D-01', aisle: 'Aisle 13', level: 'Reel 01', sku: 'CAB-8820', name: 'Shielded Drag Cable', qty: 22, maxQty: 30, status: 'OCCUPIED' },
    { id: 'D-02', aisle: 'Aisle 13', level: 'Reel 02', sku: 'CAB-8820', name: 'Shielded Drag Cable', qty: 20, maxQty: 30, status: 'OCCUPIED' },
    { id: 'D-03', aisle: 'Aisle 14', level: 'Rack Floor', sku: null, name: 'Heavy Structural Steel', qty: 0, maxQty: 50, status: 'VACANT' },
    { id: 'D-04', aisle: 'Aisle 14', level: 'Rack Floor', sku: null, name: 'Raw Material Buffer', qty: 0, maxQty: 50, status: 'VACANT' },
  ];
};

export const WarehousePage = () => {
  const { zones, setZones, products } = useInventory();
  const [selectedZone, setSelectedZone] = useState(() => (zones && zones.length > 0 ? zones[0] : INITIAL_ZONES[0]));
  const [bins, setBins] = useState(() => GENERATE_BINS(selectedZone?.id || 'zone-a'));
  const [selectedBin, setSelectedBin] = useState(null);
  const [skuSearch, setSkuSearch] = useState('');
  const [binFilter, setBinFilter] = useState('ALL'); // 'ALL' | 'OCCUPIED' | 'VACANT'

  // Modals & Feedback
  const [isAddZoneModalOpen, setIsAddZoneModalOpen] = useState(false);
  const [isAllocateBinModalOpen, setIsAllocateBinModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Zone form
  const [newZoneCode, setNewZoneCode] = useState('');
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneAisles, setNewZoneAisles] = useState('Aisles 17-20');
  const [newZoneTemp, setNewZoneTemp] = useState('20.5°C Ambient');
  const [newZoneCapacity, setNewZoneCapacity] = useState('120 Bins');
  const [newZoneItems, setNewZoneItems] = useState('Buffer Inventory');

  // Bin Allocation form
  const [allocSku, setAllocSku] = useState(products[0]?.sku || 'MTR-9002');
  const [allocQty, setAllocQty] = useState(25);
  const [allocStatus, setAllocStatus] = useState('OCCUPIED');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // When zone changes, load its bin matrix
  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
    setBins(GENERATE_BINS(zone.id));
    setSelectedBin(null);
  };

  // CRUD: Add Facility Zone
  const handleCreateZone = (e) => {
    e.preventDefault();
    const newZone = {
      id: `zone-${Date.now().toString().slice(-4)}`,
      code: newZoneCode.toUpperCase() || `ZONE-${String.fromCharCode(65 + zones.length)}`,
      name: newZoneName || 'Additional Staging Bay',
      aisles: newZoneAisles,
      temp: newZoneTemp,
      capacity: newZoneCapacity,
      occupancy: 0,
      primaryItems: newZoneItems,
    };
    const updatedZones = [...zones, newZone];
    setZones(updatedZones);
    setSelectedZone(newZone);
    setBins(GENERATE_BINS(newZone.id));
    setIsAddZoneModalOpen(false);
    setNewZoneCode('');
    setNewZoneName('');
    showToast(`✓ New storage facility ${newZone.name} created and saved to localStorage!`);
  };

  // CRUD: Delete Facility Zone
  const handleDeleteZone = (zoneToDelete, e) => {
    e.stopPropagation();
    if (zones.length <= 1) {
      showToast('Cannot delete the last remaining warehouse zone.');
      return;
    }
    if (window.confirm(`Delete zone ${zoneToDelete.name}? Bins and racks will be removed.`)) {
      const remaining = zones.filter((z) => z.id !== zoneToDelete.id);
      setZones(remaining);
      if (selectedZone.id === zoneToDelete.id) {
        setSelectedZone(remaining[0]);
        setBins(GENERATE_BINS(remaining[0].id));
      }
      showToast(`🗑 Zone ${zoneToDelete.name} deleted.`);
    }
  };

  // CRUD: Allocate / Reassign Bin
  const handleSaveBinAllocation = (e) => {
    e.preventDefault();
    if (!selectedBin) return;

    const prod = products.find((p) => p.sku === allocSku) || products[0];
    const qty = parseInt(allocQty, 10) || 0;

    const updatedBins = bins.map((b) =>
      b.id === selectedBin.id
        ? {
          ...b,
          sku: allocStatus === 'VACANT' ? null : prod.sku,
          name: allocStatus === 'VACANT' ? 'Vacant Bin' : prod.name,
          qty: allocStatus === 'VACANT' ? 0 : qty,
          status: allocStatus,
        }
        : b
    );

    setBins(updatedBins);
    setSelectedBin(updatedBins.find((b) => b.id === selectedBin.id));
    setIsAllocateBinModalOpen(false);
    showToast(`✓ Bin ${selectedBin.id} allocation updated to ${allocStatus}!`);
  };

  // CRUD: Vacate Bin
  const handleVacateBin = () => {
    if (!selectedBin) return;
    const updatedBins = bins.map((b) =>
      b.id === selectedBin.id
        ? { ...b, sku: null, name: 'Vacant Bin', qty: 0, status: 'VACANT' }
        : b
    );
    setBins(updatedBins);
    setSelectedBin(updatedBins.find((b) => b.id === selectedBin.id));
    showToast(`✓ Bin ${selectedBin.id} vacated and cleared.`);
  };

  const filteredBins = bins.filter((b) => {
    const matchesFilter =
      binFilter === 'ALL' ||
      (binFilter === 'OCCUPIED' && (b.status === 'OCCUPIED' || b.status === 'LOW')) ||
      (binFilter === 'VACANT' && b.status === 'VACANT');
    const matchesSearch =
      !skuSearch ||
      b.id.toLowerCase().includes(skuSearch.toLowerCase()) ||
      (b.sku && b.sku.toLowerCase().includes(skuSearch.toLowerCase())) ||
      (b.name && b.name.toLowerCase().includes(skuSearch.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ padding: 'var(--ss-space-6)', maxWidth: '1680px', margin: '0 auto', width: '100%' }}>
      {/* Toast */}
      {toastMessage && (
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
          <span style={{ color: 'var(--ss-primary)', fontSize: '1.25rem' }}>🏗️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--ss-primary)' }}>
              Warehouse Layout Updated
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              {toastMessage}
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
              Facility Digital Twin & Warehouse Layout
            </h1>
            <span className="ss-badge ss-badge-info">WH-01: MAIN DC (BAY AREA)</span>
            <span className="ss-badge ss-badge-success">PERSISTED LOCALSTORAGE</span>
          </div>
          <p style={{ color: 'var(--ss-text-secondary)', fontSize: 'var(--ss-text-sm)' }}>
            140,000 sq ft facility cadastre. Interactive rack & bin locator, volumetric occupancy heatmaps, and dock gates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.35rem 0.75rem',
              background: 'var(--ss-bg-surface-elevated)',
              border: '1px solid var(--ss-border)',
              borderRadius: 'var(--ss-radius-md)',
              fontSize: '0.75rem',
              color: 'var(--ss-text-secondary)',
            }}
          >
            IoT Sensor Hub: <strong style={{ color: 'var(--ss-success-text)' }}>20.4°C Nominal • 44% RH</strong>
          </div>
          <button
            type="button"
            className="ss-btn ss-btn-primary"
            onClick={() => setIsAddZoneModalOpen(true)}
          >
            + Add Facility Zone
          </button>
        </div>
      </div>

      {/* Real-time Macro Facility Telemetry Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--ss-space-4)',
          marginBottom: 'var(--ss-space-6)',
        }}
      >
        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Facility Capacity
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '0.25rem' }}>
                1,500 <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>bins</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-primary">
              🏢
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Across 16 high-bay aisles
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-warning-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Current Occupancy
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-warning-text)', marginTop: '0.25rem' }}>
                1,037 <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>(69.1%)</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-warning">
              📊
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Zone C dispatch at 91%
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-success-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Vacant Storage Slots
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-success-text)', marginTop: '0.25rem' }}>
                463 <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>bins</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-success">
              ✅
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            Immediate putaway capacity
          </div>
        </div>

        <div className="ss-stat-card" style={{ borderTop: '3px solid var(--ss-info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-info-text)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Active Dock Doors
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', marginTop: '0.25rem' }}>
                4 <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ss-text-muted)' }}>doors</span>
              </div>
            </div>
            <div className="ss-icon-avatar ss-icon-avatar-info">
              🚪
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', paddingTop: '0.4rem', borderTop: '1px solid var(--ss-border-subtle)' }}>
            2 Inbound • 2 Outbound
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: THE INTERACTIVE 2D WAREHOUSE DIGITAL TWIN BLUEPRINT
         ========================================================================= */}
      <div className="ss-card" style={{ padding: 'var(--ss-space-5)', marginBottom: 'var(--ss-space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
              Top-Down Digital Twin Blueprint (Click Any Zone to Inspect Bins)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)' }}>
              West perimeter receives supplier freight; East perimeter stages customer dispatches.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', background: 'var(--ss-success)', borderRadius: '2px' }} />
              Optimal (&lt;80%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', background: 'var(--ss-warning)', borderRadius: '2px' }} />
              Warning (80-90%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', background: 'var(--ss-danger)', borderRadius: '2px' }} />
              High Density (&gt;90%)
            </span>
          </div>
        </div>

        {/* 2D Interactive Blueprint Map */}
        {/* 2D Interactive Blueprint Map — Light Theme */}
        <div
          style={{
            background: 'var(--ss-bg-app)',
            border: '1.5px solid var(--ss-border)',
            borderRadius: 'var(--ss-radius-lg)',
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: '140px 1fr 155px',
            gap: '1rem',
            minHeight: '320px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* WEST PERIMETER: Inbound Receiving Docks */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              background: 'var(--ss-success-bg)',
              border: '1.5px dashed var(--ss-success-border)',
              borderRadius: 'var(--ss-radius-md)',
              padding: '0.875rem 0.625rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-success-text)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              📥 Inbound Docks
            </div>

            <div style={{ padding: '0.5rem 0.625rem', background: '#ffffff', borderRadius: 'var(--ss-radius-sm)', border: '1px solid var(--ss-success-border)' }}>
              <strong style={{ fontSize: '0.75rem', color: 'var(--ss-success-text)', display: 'block' }}>Bay 01</strong>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>Docked · PO-9401</div>
            </div>

            <div style={{ padding: '0.5rem 0.625rem', background: '#ffffff', borderRadius: 'var(--ss-radius-sm)', border: '1px solid var(--ss-primary-border)' }}>
              <strong style={{ fontSize: '0.75rem', color: 'var(--ss-primary)', display: 'block' }}>Bay 02</strong>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>Active · PO-9402</div>
            </div>

            <div style={{ padding: '0.5rem 0.625rem', background: '#ffffff', borderRadius: 'var(--ss-radius-sm)', border: '1px solid var(--ss-border)' }}>
              <strong style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)', display: 'block' }}>Dock 03</strong>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginTop: '2px' }}>Vacant · Ready</div>
            </div>
          </div>

          {/* MAIN WAREHOUSE CORE: Storage Zones A, B, D, Vault */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '0.75rem' }}>

            {/* Zone A Block */}
            <div
              onClick={() => handleSelectZone(zones[0])}
              style={{
                background: selectedZone.id === 'zone-a' ? 'var(--ss-primary-subtle)' : '#ffffff',
                border: selectedZone.id === 'zone-a' ? '2px solid var(--ss-primary)' : '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-md)',
                padding: '0.875rem 1rem',
                cursor: 'pointer',
                transition: 'all 180ms ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: selectedZone.id === 'zone-a' ? '0 0 0 3px rgba(79,70,229,0.12)' : 'var(--ss-shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>ZONE A</span>
                <span className="ss-badge ss-badge-success">{zones[0].occupancy}%</span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.3rem' }}>
                High-Bay Pallet Racks
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                Aisles 01–06 · Motors & Hardware
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontFamily: 'var(--ss-font-mono)', marginTop: '0.35rem' }}>
                {zones[0].capacity}
              </div>
            </div>

            {/* Zone B Block */}
            <div
              onClick={() => handleSelectZone(zones[1])}
              style={{
                background: selectedZone.id === 'zone-b' ? 'var(--ss-primary-subtle)' : '#ffffff',
                border: selectedZone.id === 'zone-b' ? '2px solid var(--ss-primary)' : '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-md)',
                padding: '0.875rem 1rem',
                cursor: 'pointer',
                transition: 'all 180ms ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: selectedZone.id === 'zone-b' ? '0 0 0 3px rgba(79,70,229,0.12)' : 'var(--ss-shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>ZONE B</span>
                <span className="ss-badge ss-badge-success">{zones[1].occupancy}%</span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.3rem' }}>
                Bulk Bay Storage
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                Aisles 07–12 · Pneumatics & Valves
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontFamily: 'var(--ss-font-mono)', marginTop: '0.35rem' }}>
                {zones[1].capacity}
              </div>
            </div>

            {/* Zone D Block */}
            <div
              onClick={() => handleSelectZone(zones[3])}
              style={{
                background: selectedZone.id === 'zone-d' ? 'var(--ss-primary-subtle)' : '#ffffff',
                border: selectedZone.id === 'zone-d' ? '2px solid var(--ss-primary)' : '1px solid var(--ss-border)',
                borderRadius: 'var(--ss-radius-md)',
                padding: '0.875rem 1rem',
                cursor: 'pointer',
                transition: 'all 180ms ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: selectedZone.id === 'zone-d' ? '0 0 0 3px rgba(79,70,229,0.12)' : 'var(--ss-shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>ZONE D</span>
                <span className="ss-badge ss-badge-neutral">{zones[3].occupancy}%</span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.3rem' }}>
                Raw Materials
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)' }}>
                Aisles 13–16 · Cables & Spools
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontFamily: 'var(--ss-font-mono)', marginTop: '0.35rem' }}>
                {zones[3].capacity}
              </div>
            </div>

            {/* Secure Vault Block */}
            <div
              onClick={() => handleSelectZone(zones[4])}
              style={{
                background: selectedZone.id === 'zone-v' ? 'var(--ss-primary-subtle)' : 'var(--ss-warning-bg)',
                border: selectedZone.id === 'zone-v' ? '2px solid var(--ss-primary)' : '1.5px solid var(--ss-warning-border)',
                borderRadius: 'var(--ss-radius-md)',
                padding: '0.875rem 1rem',
                cursor: 'pointer',
                transition: 'all 180ms ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: selectedZone.id === 'zone-v' ? '0 0 0 3px rgba(79,70,229,0.12)' : 'var(--ss-shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--ss-warning-text)' }}>🔒 VAULT</span>
                <span className="ss-badge ss-badge-warning">{zones[4].occupancy}%</span>
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--ss-warning-text)', marginBottom: '0.3rem' }}>
                Secure Storage
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-secondary)' }}>
                V01–V04 · PLCs, HMIs & Chips
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-muted)', fontFamily: 'var(--ss-font-mono)', marginTop: '0.35rem' }}>
                {zones[4].capacity}
              </div>
            </div>
          </div>

          {/* EAST PERIMETER: Zone C Rapid Dispatch & Outbound Loading */}
          <div
            onClick={() => handleSelectZone(zones[2])}
            style={{
              background: selectedZone.id === 'zone-c' ? 'var(--ss-primary-subtle)' : 'var(--ss-danger-bg)',
              border: selectedZone.id === 'zone-c' ? '2px solid var(--ss-primary)' : '1.5px dashed var(--ss-danger-border)',
              borderRadius: 'var(--ss-radius-md)',
              padding: '0.875rem 0.625rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              gap: '0.5rem',
              boxShadow: selectedZone.id === 'zone-c' ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--ss-danger-text)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                📤 Zone C: Dispatch
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ss-warning-text)', marginTop: '4px' }}>
                91% Full
              </div>
            </div>

            <div style={{ padding: '0.45rem 0.5rem', background: '#ffffff', borderRadius: 'var(--ss-radius-sm)', border: '1px solid var(--ss-info-border)' }}>
              <strong style={{ fontSize: '0.75rem', color: 'var(--ss-info-text)', display: 'block' }}>Staging C01</strong>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>Tesla Order</div>
            </div>

            <div style={{ padding: '0.45rem 0.5rem', background: '#ffffff', borderRadius: 'var(--ss-radius-sm)', border: '1px solid var(--ss-info-border)' }}>
              <strong style={{ fontSize: '0.75rem', color: 'var(--ss-info-text)', display: 'block' }}>Staging C02</strong>
              <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>Boeing Order</div>
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-danger-text)' }}>
              Outbound Gates →
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: GRANULAR RACK & BIN HEATMAP INSPECTOR FOR SELECTED ZONE
         ========================================================================= */}
      <div className="ss-card" style={{ marginBottom: 'var(--ss-space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                Granular Bin Inspector: {selectedZone.name}
              </h3>
              <span className="ss-badge ss-badge-info">{selectedZone.code}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginTop: '2px' }}>
              Click any bin cell below to view stored SKU, inventory quantity, and bin capacity.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="ss-input"
              placeholder="Find SKU or Bin ID (e.g. MTR-9002, A-02)..."
              value={skuSearch}
              onChange={(e) => setSkuSearch(e.target.value)}
              style={{ width: '240px', fontSize: '0.75rem' }}
            />

            <select
              className="ss-select"
              value={binFilter}
              onChange={(e) => setBinFilter(e.target.value)}
              style={{ width: 'auto', fontSize: '0.75rem' }}
            >
              <option value="ALL">All Bins</option>
              <option value="OCCUPIED">Occupied Bins</option>
              <option value="VACANT">Vacant Bins</option>
            </select>
          </div>
        </div>

        {/* Bin Grid Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '0.625rem',
            marginBottom: '1rem',
          }}
        >
          {filteredBins.map((bin) => {
            const isSelected = selectedBin?.id === bin.id;
            const isOccupied = bin.status === 'OCCUPIED';
            const isLow = bin.status === 'LOW';
            const isVacant = bin.status === 'VACANT';
            const isReserved = bin.status === 'RESERVED';

            return (
              <div
                key={bin.id}
                onClick={() => setSelectedBin(bin)}
                style={{
                  padding: '0.625rem',
                  borderRadius: 'var(--ss-radius-md)',
                  cursor: 'pointer',
                  border: isSelected
                    ? '2px solid var(--ss-border-focus)'
                    : isOccupied
                      ? '1px solid var(--ss-success-border)'
                      : isLow
                        ? '1px solid var(--ss-warning-border)'
                        : isReserved
                          ? '1px solid var(--ss-info-border)'
                          : '1px solid var(--ss-border)',
                  background: isSelected
                    ? 'var(--ss-primary-subtle)'
                    : isOccupied
                      ? 'rgba(16, 185, 129, 0.08)'
                      : isLow
                        ? 'rgba(245, 158, 11, 0.08)'
                        : isReserved
                          ? 'rgba(6, 182, 212, 0.08)'
                          : 'var(--ss-bg-app)',
                  transition: 'all 150ms ease',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--ss-font-mono)', fontSize: '0.8125rem', color: 'var(--ss-text-primary)' }}>
                    {bin.id}
                  </span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--ss-text-muted)' }}>{bin.level}</span>
                </div>

                {bin.sku ? (
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'var(--ss-font-mono)', color: isLow ? 'var(--ss-warning-text)' : 'var(--ss-success-text)' }}>
                      {bin.sku}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ss-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {bin.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)', marginTop: '4px' }}>
                      {bin.qty} <span style={{ fontSize: '0.625rem', color: 'var(--ss-text-muted)' }}>/ {bin.maxQty}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0.5rem 0', color: 'var(--ss-text-disabled)', fontSize: '0.6875rem' }}>
                    {isReserved ? '⚡ Reserved' : '○ Vacant'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Bin Inspection Drawer / Panel */}
        {selectedBin && (
          <div
            style={{
              padding: '1rem',
              background: 'var(--ss-bg-surface-elevated)',
              border: '1px solid var(--ss-border-focus)',
              borderRadius: 'var(--ss-radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              animation: 'fadeIn 150ms ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-text-primary)' }}>
                  Bin Location: {selectedBin.id} ({selectedBin.aisle} • {selectedBin.level})
                </span>
                <span className={`ss-badge ${selectedBin.sku ? 'ss-badge-success' : 'ss-badge-neutral'}`}>
                  {selectedBin.status}
                </span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)', marginTop: '4px' }}>
                {selectedBin.sku ? (
                  <>
                    Stored Item: <strong>{selectedBin.name}</strong> (SKU: <code>{selectedBin.sku}</code>) • On-Hand: <strong>{selectedBin.qty} units</strong> (Max: {selectedBin.maxQty})
                  </>
                ) : (
                  <>Slot is vacant and ready for inbound putaway.</>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="ss-btn ss-btn-primary"
                onClick={() => {
                  setAllocSku(selectedBin.sku || products[0]?.sku || 'MTR-9002');
                  setAllocQty(selectedBin.qty || 20);
                  setAllocStatus(selectedBin.status === 'VACANT' ? 'OCCUPIED' : selectedBin.status);
                  setIsAllocateBinModalOpen(true);
                }}
                style={{ fontSize: '0.75rem' }}
              >
                ✎ Allocate / Reassign SKU
              </button>
              {selectedBin.status !== 'VACANT' && (
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={handleVacateBin}
                  style={{ fontSize: '0.75rem', color: 'var(--ss-danger)' }}
                >
                  Vacate Bin
                </button>
              )}
              <button
                type="button"
                className="ss-btn ss-btn-secondary"
                onClick={() => setSelectedBin(null)}
                style={{ fontSize: '0.75rem' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 3: FACILITY ZONES COMPREHENSIVE CARDS
         ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: 'var(--ss-space-4)',
        }}
      >
        {zones.map((zone) => {
          const isSelected = selectedZone.id === zone.id;
          const isWarning = zone.occupancy > 85;

          return (
            <div
              key={zone.id}
              className="ss-card"
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--ss-primary)' : 'var(--ss-border)',
                background: isSelected ? 'var(--ss-bg-surface-elevated)' : 'var(--ss-bg-surface)',
                boxShadow: isSelected ? 'var(--ss-shadow-glow-primary)' : 'var(--ss-shadow-sm)',
                transition: 'all 150ms ease',
              }}
              onClick={() => handleSelectZone(zone)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--ss-font-mono)', color: 'var(--ss-primary)', fontWeight: 700 }}>
                    {zone.code}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ss-text-primary)' }}>
                    {zone.name}
                  </h3>
                </div>
                <span className={`ss-badge ${isWarning ? 'ss-badge-warning' : 'ss-badge-success'}`}>
                  {zone.occupancy}% Full
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-secondary)', marginBottom: '0.75rem' }}>
                {zone.aisles} • Climate: {zone.temp}
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--ss-text-muted)', marginBottom: '4px' }}>
                  <span>Capacity Utilization</span>
                  <span style={{ fontFamily: 'var(--ss-font-mono)' }}>{zone.capacity}</span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: 'var(--ss-bg-app)',
                    borderRadius: 'var(--ss-radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${zone.occupancy}%`,
                      background: isWarning ? 'var(--ss-warning)' : 'var(--ss-primary)',
                      borderRadius: 'var(--ss-radius-full)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--ss-text-muted)' }}>
                  Primary Items: <strong style={{ color: 'var(--ss-text-primary)' }}>{zone.primaryItems}</strong>
                </div>
                {zones.length > 1 && (
                  <button
                    type="button"
                    className="ss-btn ss-btn-ghost"
                    onClick={(e) => handleDeleteZone(zone, e)}
                    title="Delete Zone"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', color: 'var(--ss-danger)' }}
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Facility Zone Modal */}
      {isAddZoneModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--ss-modal-backdrop)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="ss-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: 'var(--ss-bg-surface)',
              border: '1px solid var(--ss-border)',
              boxShadow: 'var(--ss-shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                  Add Facility Storage Zone
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Define a new warehouse storage sector (Saves to localStorage).
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setIsAddZoneModalOpen(false)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateZone} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Zone Code
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    placeholder="e.g. ZONE-E"
                    value={newZoneCode}
                    onChange={(e) => setNewZoneCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Zone Name
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    placeholder="e.g. Cold Chain Staging"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Aisles Span
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={newZoneAisles}
                    onChange={(e) => setNewZoneAisles(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Climate / Temp
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={newZoneTemp}
                    onChange={(e) => setNewZoneTemp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Capacity
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={newZoneCapacity}
                    onChange={(e) => setNewZoneCapacity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Primary SKU Types
                  </label>
                  <input
                    type="text"
                    className="ss-input"
                    value={newZoneItems}
                    onChange={(e) => setNewZoneItems(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setIsAddZoneModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ss-btn ss-btn-primary">
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate / Reassign Bin Modal */}
      {isAllocateBinModalOpen && selectedBin && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--ss-modal-backdrop)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="ss-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: 'var(--ss-bg-surface)',
              border: '1px solid var(--ss-border)',
              boxShadow: 'var(--ss-shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ss-text-primary)' }}>
                  Allocate / Reassign Bin {selectedBin.id}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ss-text-secondary)' }}>
                  Aisle: {selectedBin.aisle} • Level: {selectedBin.level}
                </p>
              </div>
              <button
                type="button"
                className="ss-btn ss-btn-ghost"
                onClick={() => setIsAllocateBinModalOpen(false)}
                style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBinAllocation} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                  Product SKU to Allocate
                </label>
                <select
                  className="ss-select"
                  value={allocSku}
                  onChange={(e) => setAllocSku(e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.sku} — {p.name} ({p.onHand} units on-hand)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Allocated Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedBin.maxQty || 100}
                    className="ss-input"
                    value={allocQty}
                    onChange={(e) => setAllocQty(parseInt(e.target.value, 10) || 0)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ss-text-secondary)', marginBottom: '0.25rem' }}>
                    Bin Status
                  </label>
                  <select
                    className="ss-select"
                    value={allocStatus}
                    onChange={(e) => setAllocStatus(e.target.value)}
                  >
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="LOW">LOW</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="VACANT">VACANT</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="ss-btn ss-btn-secondary"
                  onClick={() => setIsAllocateBinModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ss-btn ss-btn-primary">
                  Save Bin Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousePage;
