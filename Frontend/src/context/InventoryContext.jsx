import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProducts, fetchReceipts, fetchDeliveries, fetchTransfers, fetchLedger } from '../services/api';
import {
  INITIAL_PRODUCTS,
  INITIAL_LEDGER,
  INITIAL_RECEIPTS_QUEUE,
  INITIAL_TRANSFERS_QUEUE,
  INITIAL_DELIVERIES_QUEUE,
  INITIAL_ADJUSTMENTS,
  INITIAL_ZONES,
  INITIAL_SETTINGS,
  INITIAL_WAREHOUSES,
  INITIAL_SUPPLIERS,
} from '../services/mockData';

const InventoryContext = createContext(null);

const STORAGE_KEYS = {
  PRODUCTS: 'stocksense_products_v1',
  LEDGER: 'stocksense_ledger_v1',
  RECEIPTS: 'stocksense_receipts_v1',
  TRANSFERS: 'stocksense_transfers_v1',
  DELIVERIES: 'stocksense_deliveries_v1',
  ADJUSTMENTS: 'stocksense_adjustments_v1',
  ZONES: 'stocksense_zones_v1',
  SETTINGS: 'stocksense_settings_v1',
  WAREHOUSES: 'stocksense_warehouses_v1',
  SUPPLIERS: 'stocksense_suppliers_v1',
  NOTIFICATIONS: 'stocksense_notifications_v1',
};

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-01',
    type: 'DISCREPANCY_APPROVAL',
    title: 'Discrepancy Approval Required',
    message: 'Alex Rivera (Staff) recorded a -20 unit variance on Industrial High-Torque Servo Motor 48V (MTR-9002) at Zone C. Manager authorization required to reconcile ledger.',
    urgency: 'HIGH',
    timestamp: '15 mins ago',
    read: false,
    referenceNumber: 'ADJ-1589',
    sku: 'MTR-9002',
    delta: -20,
    targetRole: 'INVENTORY_MANAGER',
  },
  {
    id: 'notif-02',
    type: 'INBOUND_ARRIVED',
    title: 'Inbound PO-2026-088 Staged at Dock 01',
    message: 'Shipment from Siemens Industrial received. 45 units staged and ready for putaway.',
    urgency: 'NORMAL',
    timestamp: '1 hour ago',
    read: false,
    targetRole: 'ALL',
  },
  {
    id: 'notif-03',
    type: 'LOW_STOCK',
    title: 'Low Stock Safety Alert',
    message: 'Shielded Drag Chain Cable (CAB-8820) reached 42 units (Reorder threshold: 50).',
    urgency: 'NORMAL',
    timestamp: '2 hours ago',
    read: true,
    targetRole: 'INVENTORY_MANAGER',
  },
];

// Helper to safely load from localStorage with fallback
const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Failed to parse ${key} from localStorage, using fallback:`, e);
    return fallback;
  }
};

export const InventoryProvider = ({ children }) => {
  // Persisted Core State
  const [products, setProducts] = useState(() =>
    loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );

  const [ledger, setLedger] = useState(() =>
    loadFromStorage(STORAGE_KEYS.LEDGER, INITIAL_LEDGER)
  );

  const [receipts, setReceipts] = useState(() =>
    loadFromStorage(STORAGE_KEYS.RECEIPTS, INITIAL_RECEIPTS_QUEUE)
  );

  const [transfers, setTransfers] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS_QUEUE)
  );

  const [deliveries, setDeliveries] = useState(() =>
    loadFromStorage(STORAGE_KEYS.DELIVERIES, INITIAL_DELIVERIES_QUEUE)
  );

  const [adjustments, setAdjustments] = useState(() =>
    loadFromStorage(STORAGE_KEYS.ADJUSTMENTS, INITIAL_ADJUSTMENTS)
  );

  const [zones, setZones] = useState(() =>
    loadFromStorage(STORAGE_KEYS.ZONES, INITIAL_ZONES)
  );

  const [settings, setSettings] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
  );

  const [warehouses, setWarehouses] = useState(() =>
    loadFromStorage(STORAGE_KEYS.WAREHOUSES, INITIAL_WAREHOUSES)
  );

  const [activeWarehouse, setActiveWarehouse] = useState(() =>
    warehouses && warehouses.length > 0 ? warehouses[0] : INITIAL_WAREHOUSES[0]
  );

  const [suppliers, setSuppliers] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS)
  );

  const [notifications, setNotifications] = useState(() =>
    loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );

  // Fetch real data from backend
  const loadRealData = async (skip = 0, limit = 50) => {
    try {
      const [realProducts, realReceipts, realDeliveries, realTransfers, realLedger] = await Promise.all([
        fetchProducts(skip, limit),
        fetchReceipts(skip, limit),
        fetchDeliveries(skip, limit),
        fetchTransfers(skip, limit),
        fetchLedger(skip, limit)
      ]);

      if (realProducts && realProducts.length > 0) {
        // Map backend schema to frontend model
        const mappedProducts = realProducts.map(p => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category_id,
          unitCost: p.price || 0,
          unitPrice: p.price || 0,
          onHand: p.current_stock || 0,
          allocated: 0,
          available: p.current_stock || 0,
          minThreshold: 10,
          status: p.current_stock === 0 ? 'OUT_OF_STOCK' : (p.current_stock <= 10 ? 'LOW_STOCK' : 'IN_STOCK'),
          primaryLocation: `Rack A-${String(p.id % 12 + 1).padStart(2, '0')}`,
          uom: p.uom_id,
          barcode: `${1000000000 + p.id}`,
          weight: '1.0 kg',
          reorderRule: {
            minStock: 10,
            maxStock: 100,
            reorderPoint: 20,
            autoReorder: true
          },
          locations: [{ zone: 'Main Storage', bin: `Rack A-${String(p.id % 12 + 1).padStart(2, '0')}`, qty: p.current_stock || 0 }],
        }));
        setProducts(mappedProducts);
      }

      if (realReceipts && realReceipts.length > 0) {
        const mappedReceipts = realReceipts.map(r => ({
          id: `rec-${r.id}`,
          poNumber: `PO-${String(r.id).padStart(4, '0')}`,
          supplier: r.supplier_name || `Supplier ${r.supplier_id}`,
          sku: r.product_sku || 'SKU-MULTI',
          productName: r.product_name || 'Multiple Products',
          expectedQty: r.expected_qty || 0,
          dock: `Bay ${(r.id % 3) + 1}`,
          eta: 'Today, 14:00',
          carrier: 'Global Express Freight',
          status: r.status.toUpperCase() === 'VALIDATED' ? 'RECEIVED' : r.status.toUpperCase(),
          targetLocation: `Rack A-${String(r.id % 12 + 1).padStart(2, '0')}`,
        }));
        setReceipts(mappedReceipts);
      }

      if (realDeliveries && realDeliveries.length > 0) {
        const mappedDeliveries = realDeliveries.map(d => ({
          id: `del-${d.id}`,
          orderNo: `SO-${String(d.id).padStart(4, '0')}`,
          customer: d.customer_name,
          sku: d.product_sku || 'SKU-MULTI',
          productName: d.product_name || 'Multiple Products',
          qty: d.qty || 0,
          destination: `${d.customer_name} HQ`,
          carrier: 'FedEx Freight Priority',
          deadline: 'Today, EOD',
          sourceLocation: `Rack A-${String(d.id % 12 + 1).padStart(2, '0')}`,
          status: d.status.toUpperCase() === 'SHIPPED' ? 'DISPATCHED' : d.status.toUpperCase(),
          priority: 'HIGH',
        }));
        setDeliveries(mappedDeliveries);
      }

      if (realTransfers && realTransfers.length > 0) {
        const mappedTransfers = realTransfers.map(t => ({
          id: `tr-${t.id}`,
          transferNo: `TR-${String(t.id).padStart(4, '0')}`,
          sku: 'SKU-MULTI',
          productName: 'Internal Transfer',
          qty: t.qty || 10,
          fromLocation: `Rack A-${String(t.source_location_id % 12 + 1).padStart(2, '0')}`,
          toLocation: `Rack B-${String(t.destination_location_id % 5 + 1).padStart(2, '0')}`,
          fromWarehouse: 'Main DC (Bay Area)',
          toWarehouse: 'East Coast Hub',
          priority: 'MEDIUM',
          reason: 'Stock Rebalancing',
          status: t.status.toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'SCHEDULED',
          requestedBy: 'System',
        }));
        setTransfers(mappedTransfers);
      }

      if (realLedger && realLedger.length > 0) {
        const mappedLedger = realLedger.map(l => ({
          id: `tx-${l.id}`,
          timestamp: l.created_at,
          type: l.operation_type,
          reference: l.reference_id,
          sku: `SKU-${10000 + l.product_id}`, // naive mapping
          productName: 'Database Ledger Entry',
          source: `Location ${l.location_id}`,
          destination: l.operation_type,
          qtyChange: l.quantity,
          balanceAfter: l.quantity,
          operator: 'System User',
          note: `Auto-generated ${l.operation_type} entry`,
        }));
        setLedger(mappedLedger);
      }
    } catch (err) {
      console.error("Failed to load data from backend:", err);
    }
  };

  useEffect(() => {
    loadRealData();
  }, []);

  // Sync state to localStorage whenever modified
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Notifications Helpers
  const addNotification = (notif) => {
    const newNotif = {
      id: notif.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: notif.timestamp || 'Just now',
      read: false,
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    return newNotif;
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(adjustments));
  }, [adjustments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  // =========================================================================
  // RESET ALL DATA TO PRISTINE BASELINE
  // =========================================================================
  const resetAllData = () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    setProducts(INITIAL_PRODUCTS);
    setLedger(INITIAL_LEDGER);
    setReceipts(INITIAL_RECEIPTS_QUEUE);
    setTransfers(INITIAL_TRANSFERS_QUEUE);
    setDeliveries(INITIAL_DELIVERIES_QUEUE);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setZones(INITIAL_ZONES);
    setSettings(INITIAL_SETTINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  // Helper to record immutable ledger entries
  const recordLedgerEntry = ({ type, reference, sku, productName, source, destination, qtyChange, balanceAfter, operator, note }) => {
    const newTx = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      type,
      reference,
      sku,
      productName,
      source,
      destination,
      qtyChange,
      balanceAfter,
      operator: operator || 'Sarah Chen (Manager)',
      note: note || `${type} operation recorded`,
    };
    setLedger((prev) => [newTx, ...prev]);
  };

  // =========================================================================
  // 1. PRODUCTS CRUD
  // =========================================================================
  const addProduct = (productData) => {
    const qty = parseInt(productData.onHand, 10) || 0;
    const min = parseInt(productData.minThreshold, 10) || 10;
    const newProd = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      sku: productData.sku.toUpperCase(),
      name: productData.name,
      category: productData.category || 'General',
      unitCost: parseFloat(productData.unitCost) || 0,
      unitPrice: parseFloat(productData.unitPrice) || 0,
      onHand: qty,
      allocated: 0,
      available: qty,
      minThreshold: min,
      status: qty === 0 ? 'OUT_OF_STOCK' : qty <= min ? 'LOW_STOCK' : 'IN_STOCK',
      primaryLocation: productData.primaryLocation || 'Rack A-01',
      uom: productData.uom || 'Units',
      barcode: productData.barcode || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      weight: productData.weight || '1.0 kg',
      reorderRule: productData.reorderRule || {
        minStock: min,
        maxStock: parseInt(productData.maxStock, 10) || min * 5,
        reorderPoint: parseInt(productData.reorderPoint, 10) || min + 15,
        autoReorder: productData.autoReorder ?? true,
      },
      locations: [{ zone: 'Main Storage', bin: productData.primaryLocation || 'Rack A-01', qty }],
    };

    setProducts((prev) => [newProd, ...prev]);

    recordLedgerEntry({
      type: 'ADJUSTMENT',
      reference: `INIT-${newProd.sku}`,
      sku: newProd.sku,
      productName: newProd.name,
      source: 'Initial Master Cataloging',
      destination: newProd.primaryLocation,
      qtyChange: qty,
      balanceAfter: qty,
      note: 'Initial catalog SKU registration',
    });

    return newProd;
  };

  const editProduct = (id, updatedData) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id && p.sku !== id) return p;
        const newOnHand = updatedData.onHand !== undefined ? parseInt(updatedData.onHand, 10) : p.onHand;
        const min = updatedData.minThreshold !== undefined ? parseInt(updatedData.minThreshold, 10) : p.minThreshold;
        const newStatus = newOnHand === 0 ? 'OUT_OF_STOCK' : newOnHand <= min ? 'LOW_STOCK' : 'IN_STOCK';

        return {
          ...p,
          ...updatedData,
          onHand: newOnHand,
          available: newOnHand - (p.allocated || 0),
          minThreshold: min,
          status: newStatus,
          reorderRule: updatedData.reorderRule ? { ...p.reorderRule, ...updatedData.reorderRule } : p.reorderRule,
        };
      })
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id && p.sku !== id));
  };

  // =========================================================================
  // WAREHOUSES CRUD
  // =========================================================================
  const addWarehouse = (whData) => {
    const newWh = {
      id: `wh-${Date.now().toString().slice(-4)}`,
      code: whData.code.toUpperCase(),
      name: whData.name,
      city: whData.city || 'Regional Center',
      address: whData.address || 'Industrial Parkway',
      capacity: whData.capacity || '1,000 Pallets',
      occupancyPct: 50,
      status: 'ONLINE',
      manager: whData.manager || 'Sarah Chen',
    };
    setWarehouses((prev) => [newWh, ...prev]);
    return newWh;
  };

  const editWarehouse = (id, updatedData) => {
    setWarehouses((prev) =>
      prev.map((w) => (w.id === id || w.code === id ? { ...w, ...updatedData } : w))
    );
  };

  const deleteWarehouse = (id) => {
    setWarehouses((prev) => prev.filter((w) => w.id !== id && w.code !== id));
  };

  // =========================================================================
  // 2. INBOUND RECEIPTS CRUD & CONFIRMATION
  // =========================================================================
  const addReceipt = (receiptData) => {
    const prod = products.find((p) => p.sku === receiptData.sku) || products[0];
    const newReceipt = {
      id: `rec-${Date.now().toString().slice(-4)}`,
      poNumber: receiptData.poNumber || `PO-${Math.floor(9000 + Math.random() * 1000)}`,
      supplier: receiptData.supplier || 'Industrial Supplier Co',
      sku: prod.sku,
      productName: prod.name,
      expectedQty: parseInt(receiptData.expectedQty, 10) || 20,
      dock: receiptData.dock || 'Bay 01 - Receiving',
      targetLocation: receiptData.targetLocation || prod.primaryLocation,
      eta: receiptData.eta || 'Today, Incoming',
      carrier: receiptData.carrier || 'Global Express Freight',
      status: receiptData.status || 'PENDING',
      createdAt: receiptData.createdAt || 'Just now',
    };
    setReceipts((prev) => [newReceipt, ...prev]);
    return newReceipt;
  };

  const editReceipt = (id, updatedData) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === id || r.poNumber === id ? { ...r, ...updatedData } : r))
    );
  };

  const deleteReceipt = (id) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id && r.poNumber !== id));
  };

  // Immediate causal stock increment upon receiving
  const confirmReceipt = (poNumber, receivedQty, operatorName) => {
    const receipt = receipts.find((r) => r.poNumber === poNumber || r.id === poNumber);
    if (!receipt) return;

    const qty = parseInt(receivedQty || receipt.expectedQty, 10);
    const targetProduct = products.find((p) => p.sku === receipt.sku);
    if (!targetProduct) return;

    const newOnHand = targetProduct.onHand + qty;
    const newStatus = newOnHand > targetProduct.minThreshold ? 'IN_STOCK' : 'LOW_STOCK';

    // Update product stock and attach receiving location
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku !== receipt.sku) return p;
        const locs = p.locations ? [...p.locations] : [];
        const dockBin = receipt.dock || 'Bay 01 - Receiving';
        const dockIdx = locs.findIndex((l) => l.bin === dockBin);
        if (dockIdx >= 0) {
          locs[dockIdx].qty += qty;
        } else {
          locs.push({ zone: 'Inbound Dock', bin: dockBin, qty });
        }
        return {
          ...p,
          onHand: newOnHand,
          available: newOnHand - (p.allocated || 0),
          status: newStatus,
          locations: locs,
        };
      })
    );

    // Update receipt status
    setReceipts((prev) =>
      prev.map((r) =>
        r.poNumber === poNumber || r.id === poNumber
          ? {
            ...r,
            status: 'RECEIVED',
            receivedQty: qty,
            receivedAt: 'Just now',
            receivedBy: operatorName || 'Sarah Chen (Manager)',
            readyForTransfer: true,
          }
          : r
      )
    );

    // Auto-resolve any pending backorders / delivery orders waiting for this SKU
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.sku === receipt.sku && d.status === 'AWAITING_STOCK') {
          return {
            ...d,
            status: 'READY_TO_DISPATCH',
            fulfilledByPo: receipt.poNumber,
            note: `Stock replenished via Inbound PO ${receipt.poNumber}`,
          };
        }
        return d;
      })
    );

    // Append to ledger
    recordLedgerEntry({
      type: 'RECEIPT',
      reference: receipt.poNumber,
      sku: receipt.sku,
      productName: receipt.productName,
      source: receipt.dock || 'Receiving Dock A',
      destination: receipt.targetLocation || targetProduct.primaryLocation,
      qtyChange: +qty,
      balanceAfter: newOnHand,
      operator: operatorName || 'Sarah Chen (Manager)',
      note: `Inbound PO arrival validated (+${qty} units at ${receipt.dock || 'Dock'})`,
    });
  };

  // Auto-generate replenishment PO for a low-stock / out-of-stock SKU
  const triggerReorderPO = (sku) => {
    const prod = products.find((p) => p.sku === sku);
    if (!prod) return null;

    const reorderQty = prod.reorderRule
      ? Math.max(
        prod.reorderRule.maxStock - prod.onHand,
        prod.reorderRule.minStock || 50
      )
      : Math.max(100 - prod.onHand, 50);

    const poNumber = `PO-AUTO-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPO = {
      id: `rec-${Date.now().toString().slice(-4)}`,
      poNumber,
      supplier: 'Industrial Supplier Co',
      sku: prod.sku,
      productName: prod.name,
      expectedQty: reorderQty,
      dock: 'Bay 01 - Receiving',
      targetLocation: prod.primaryLocation || 'Zone C (Rapid Dispatch)',
      carrier: 'Priority Expedited Inflow',
      eta: 'Expedited Priority Arrival',
      status: 'PENDING',
      createdAt: 'Just now',
      autoTriggered: true,
      triggerReason: `Auto-reorder: stock (${prod.onHand}) below threshold (${prod.minThreshold})`,
    };

    setReceipts((prev) => [newPO, ...prev]);

    recordLedgerEntry({
      type: 'RECEIPT',
      reference: poNumber,
      sku: prod.sku,
      productName: prod.name,
      source: 'Auto-Reorder Engine',
      destination: prod.primaryLocation || 'Inbound Dock',
      qtyChange: 0,
      balanceAfter: prod.onHand,
      operator: 'Auto-Reorder Engine',
      note: `Auto-replenishment PO created for ${prod.sku} (${reorderQty} units ordered)`,
    });

    return newPO;
  };

  // =========================================================================
  // 3. INTERNAL TRANSFERS CRUD & INTER-STORE SHIFTS
  // =========================================================================
  const addTransfer = (transferData) => {
    const prod = products.find((p) => p.sku === transferData.sku) || products[0];
    const newTransfer = {
      id: `tr-${Date.now().toString().slice(-4)}`,
      transferNo: transferData.transferNo || `TR-${Math.floor(7000 + Math.random() * 2000)}`,
      sku: prod.sku,
      productName: prod.name,
      qty: parseInt(transferData.qty, 10) || 10,
      fromLocation: transferData.fromLocation || prod.primaryLocation,
      toLocation: transferData.toLocation || 'Zone C (Rapid Dispatch)',
      fromWarehouse: transferData.fromWarehouse || activeWarehouse?.name || 'WH-01 Main DC (Bay Area)',
      toWarehouse: transferData.toWarehouse || activeWarehouse?.name || 'WH-01 Main DC (Bay Area)',
      linkedPo: transferData.linkedPo || null,
      priority: transferData.priority || 'HIGH',
      reason: transferData.reason || 'Buffer replenishment',
      status: transferData.status || 'SCHEDULED',
      requestedBy: transferData.requestedBy || 'Sarah Chen (Manager)',
      createdAt: 'Just now',
    };
    setTransfers((prev) => [newTransfer, ...prev]);
    return newTransfer;
  };

  const editTransfer = (id, updatedData) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === id || t.transferNo === id ? { ...t, ...updatedData } : t))
    );
  };

  const deleteTransfer = (id) => {
    setTransfers((prev) => prev.filter((t) => t.id !== id && t.transferNo !== id));
  };

  // Immediate causal location shift upon transfer execution
  const executeTransfer = (transferNo, operatorName) => {
    const transfer = transfers.find((t) => t.transferNo === transferNo || t.id === transferNo);
    if (!transfer) return;

    const targetProduct = products.find((p) => p.sku === transfer.sku);
    if (!targetProduct) return;

    // Update transfer status
    setTransfers((prev) =>
      prev.map((t) =>
        t.transferNo === transferNo || t.id === transferNo
          ? { ...t, status: 'COMPLETED', completedAt: 'Just now' }
          : t
      )
    );

    // Update product location quantities
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku !== transfer.sku) return p;
        const locs = p.locations ? [...p.locations] : [];
        const srcIdx = locs.findIndex((l) => l.bin === transfer.fromLocation);
        if (srcIdx >= 0) {
          locs[srcIdx].qty = Math.max(0, locs[srcIdx].qty - transfer.qty);
        }
        const destIdx = locs.findIndex((l) => l.bin === transfer.toLocation);
        if (destIdx >= 0) {
          locs[destIdx].qty += transfer.qty;
        } else {
          locs.push({
            zone: transfer.toWarehouse || 'Relocated Stock',
            bin: transfer.toLocation,
            qty: transfer.qty,
          });
        }
        return {
          ...p,
          primaryLocation: transfer.toLocation,
          locations: locs,
        };
      })
    );

    // If linked to an Inbound PO, update the receipt with transfer confirmation
    if (transfer.linkedPo) {
      setReceipts((prev) =>
        prev.map((r) =>
          r.poNumber === transfer.linkedPo || r.id === transfer.linkedPo
            ? {
              ...r,
              transferredTo: transfer.toLocation,
              shiftedToWarehouse: transfer.toWarehouse,
              transferNo: transfer.transferNo,
            }
            : r
        )
      );
    }

    // Append to ledger
    recordLedgerEntry({
      type: 'TRANSFER',
      reference: transfer.transferNo,
      sku: transfer.sku,
      productName: transfer.productName,
      source: `${transfer.fromLocation} (${transfer.fromWarehouse || 'Origin'})`,
      destination: `${transfer.toLocation} (${transfer.toWarehouse || 'Destination'})`,
      qtyChange: transfer.qty,
      isRelocation: true,
      balanceAfter: targetProduct.onHand,
      operator: operatorName || 'Sarah Chen (Manager)',
      note: `Relocated ${transfer.qty} units: ${transfer.fromLocation} → ${transfer.toLocation} [${transfer.toWarehouse || 'Local'}]`,
    });
  };

  // 1-Click: Shift received Inbound PO directly to another store/warehouse or rack
  const shiftReceiptToLocation = ({
    poNumber,
    sku,
    qty,
    fromLocation,
    toLocation,
    toWarehouse,
    reason,
    executeNow = true,
  }) => {
    // 1. Ensure receipt is acknowledged as received
    const receipt = receipts.find((r) => r.poNumber === poNumber || r.id === poNumber);
    if (receipt && receipt.status !== 'RECEIVED') {
      confirmReceipt(poNumber, qty || receipt.expectedQty, 'Sarah Chen (Manager)');
    }

    const trNumber = `TR-${Math.floor(7000 + Math.random() * 2000)}`;
    const prod =
      products.find((p) => p.sku === sku) ||
      (receipt ? products.find((p) => p.sku === receipt.sku) : products[0]);
    const transferQty = parseInt(qty, 10) || receipt?.expectedQty || 15;
    const sourceLoc = fromLocation || receipt?.dock || 'Bay 01 - Receiving';
    const destLoc = toLocation || 'Rack A-02 (Storage)';
    const targetStore = toWarehouse || 'WH-02 Midwest Regional Logistics Hub';

    const newTransfer = {
      id: `tr-${Date.now().toString().slice(-4)}`,
      transferNo: trNumber,
      sku: prod.sku,
      productName: prod.name,
      qty: transferQty,
      fromLocation: sourceLoc,
      toLocation: destLoc,
      fromWarehouse: activeWarehouse?.name || 'WH-01 Main DC (Bay Area)',
      toWarehouse: targetStore,
      linkedPo: poNumber,
      priority: 'HIGH',
      reason: reason || `Inter-Store Shift from Inbound PO ${poNumber}`,
      status: executeNow ? 'COMPLETED' : 'SCHEDULED',
      completedAt: executeNow ? 'Just now' : null,
      requestedBy: 'Sarah Chen (Manager)',
      createdAt: 'Just now',
    };

    setTransfers((prev) => [newTransfer, ...prev]);

    // Mark receipt as transferred to store
    setReceipts((prev) =>
      prev.map((r) =>
        r.poNumber === poNumber || r.id === poNumber
          ? {
            ...r,
            status: 'RECEIVED',
            transferredTo: destLoc,
            shiftedToWarehouse: targetStore,
            transferNo: trNumber,
          }
          : r
      )
    );

    // If executed now, update product locations and write to ledger
    if (executeNow) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.sku !== prod.sku) return p;
          const locs = p.locations ? [...p.locations] : [];
          const destIdx = locs.findIndex((l) => l.bin === destLoc);
          if (destIdx >= 0) {
            locs[destIdx].qty += transferQty;
          } else {
            locs.push({ zone: targetStore, bin: destLoc, qty: transferQty });
          }
          return {
            ...p,
            primaryLocation: destLoc,
            locations: locs,
          };
        })
      );

      recordLedgerEntry({
        type: 'TRANSFER',
        reference: trNumber,
        sku: prod.sku,
        productName: prod.name,
        source: `${sourceLoc} (${activeWarehouse?.name || 'Origin'})`,
        destination: `${destLoc} (${targetStore})`,
        qtyChange: transferQty,
        isRelocation: true,
        balanceAfter: prod.onHand,
        operator: 'Sarah Chen (Manager)',
        note: `Inter-Store Shift: PO ${poNumber} (${transferQty} units) → ${destLoc} [${targetStore}]`,
      });
    }

    return newTransfer;
  };

  // =========================================================================
  // 4. DELIVERY ORDERS CRUD & DISPATCH
  // =========================================================================
  const addDelivery = (deliveryData) => {
    const prod = products.find((p) => p.sku === deliveryData.sku) || products[0];
    const qty = parseInt(deliveryData.qty, 10) || 5;
    const hasEnoughStock = (prod?.available ?? 0) >= qty;
    const initialStatus = deliveryData.status || (hasEnoughStock ? 'READY_TO_DISPATCH' : 'AWAITING_STOCK');

    const newDelivery = {
      id: `del-${Date.now().toString().slice(-4)}`,
      orderNo: deliveryData.orderNo || `SO-${Math.floor(9000 + Math.random() * 1000)}`,
      customer: deliveryData.customer || 'Commercial Client Corp',
      sku: prod.sku,
      productName: prod.name,
      qty,
      sourceLocation: deliveryData.sourceLocation || prod.primaryLocation || 'Zone C (Rapid Dispatch)',
      carrier: deliveryData.carrier || 'FedEx Freight Priority',
      deadline: deliveryData.deadline || 'Today, EOD',
      destination: deliveryData.destination || 'Chicago, IL, USA',
      status: initialStatus,
      priority: deliveryData.priority || 'HIGH',
      createdAt: 'Just now',
    };
    setDeliveries((prev) => [newDelivery, ...prev]);
    return newDelivery;
  };

  const editDelivery = (id, updatedData) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id || d.orderNo === id ? { ...d, ...updatedData } : d))
    );
  };

  const deleteDelivery = (id) => {
    setDeliveries((prev) => prev.filter((d) => d.id !== id && d.orderNo !== id));
  };

  // Stage-by-stage delivery progression
  const advanceDeliveryStatus = (orderNo, targetStatus, operatorName) => {
    const delivery = deliveries.find((d) => d.orderNo === orderNo || d.id === orderNo);
    if (!delivery) return;

    if (targetStatus === 'DISPATCHED') {
      dispatchDelivery(orderNo, operatorName);
      return;
    }

    if (targetStatus === 'DELIVERED') {
      setDeliveries((prev) =>
        prev.map((d) =>
          d.orderNo === orderNo || d.id === orderNo
            ? { ...d, status: 'DELIVERED', deliveredAt: 'Just now', deliveredBy: operatorName || 'Sarah Chen (Manager)' }
            : d
        )
      );

      const targetProduct = products.find((p) => p.sku === delivery.sku);
      recordLedgerEntry({
        type: 'DELIVERY',
        reference: `PROOF-${delivery.orderNo}`,
        sku: delivery.sku,
        productName: delivery.productName,
        source: delivery.carrier || 'Carrier Delivery Fleet',
        destination: `Delivered to Customer: ${delivery.customer}`,
        qtyChange: 0,
        balanceAfter: targetProduct?.onHand || 0,
        operator: operatorName || 'Sarah Chen (Manager)',
        note: `Proof of Delivery (POD) confirmed for ${delivery.orderNo} at ${delivery.destination}`,
      });
      return;
    }

    if (targetStatus === 'ALLOCATED') {
      // Allocate/reserve stock
      setProducts((prev) =>
        prev.map((p) => {
          if (p.sku !== delivery.sku) return p;
          const newAllocated = (p.allocated || 0) + delivery.qty;
          return {
            ...p,
            allocated: newAllocated,
            available: Math.max(0, p.onHand - newAllocated),
          };
        })
      );
      setDeliveries((prev) =>
        prev.map((d) =>
          d.orderNo === orderNo || d.id === orderNo
            ? { ...d, status: 'ALLOCATED', allocatedAt: 'Just now', allocatedBy: operatorName || 'Sarah Chen (Manager)' }
            : d
        )
      );
      return;
    }

    // Default status advance (e.g. PICKED, PACKED)
    setDeliveries((prev) =>
      prev.map((d) =>
        d.orderNo === orderNo || d.id === orderNo
          ? {
            ...d,
            status: targetStatus,
            [`${targetStatus.toLowerCase()}At`]: 'Just now',
            [`${targetStatus.toLowerCase()}By`]: operatorName || 'Sarah Chen (Manager)',
          }
          : d
      )
    );
  };

  // Immediate causal stock decrement upon order dispatch
  const dispatchDelivery = (orderNo, operatorName) => {
    const delivery = deliveries.find((d) => d.orderNo === orderNo || d.id === orderNo);
    if (!delivery) return;

    const targetProduct = products.find((p) => p.sku === delivery.sku);
    if (!targetProduct) return;

    const wasAllocated = delivery.status === 'ALLOCATED' || delivery.status === 'PACKED' || delivery.status === 'PICKED';
    const newOnHand = Math.max(0, targetProduct.onHand - delivery.qty);
    const newAllocated = wasAllocated ? Math.max(0, (targetProduct.allocated || 0) - delivery.qty) : (targetProduct.allocated || 0);
    const newAvailable = Math.max(0, newOnHand - newAllocated);
    const newStatus = newOnHand === 0 ? 'OUT_OF_STOCK' : newOnHand <= targetProduct.minThreshold ? 'LOW_STOCK' : 'IN_STOCK';

    // Update location quantities
    const updatedLocations = (targetProduct.locations || []).map((loc) => {
      if (loc.bin === delivery.sourceLocation || loc.zone.includes('Rapid Dispatch')) {
        return { ...loc, qty: Math.max(0, loc.qty - delivery.qty) };
      }
      return loc;
    });

    // Update product stock
    setProducts((prev) =>
      prev.map((p) =>
        p.sku === delivery.sku
          ? {
            ...p,
            onHand: newOnHand,
            allocated: newAllocated,
            available: newAvailable,
            status: newStatus,
            locations: updatedLocations,
          }
          : p
      )
    );

    // Update delivery status
    setDeliveries((prev) =>
      prev.map((d) =>
        d.orderNo === orderNo || d.id === orderNo
          ? {
            ...d,
            status: 'DISPATCHED',
            dispatchedAt: 'Just now',
            dispatchedBy: operatorName || 'Sarah Chen (Manager)',
          }
          : d
      )
    );

    // Append to ledger
    recordLedgerEntry({
      type: 'DELIVERY',
      reference: delivery.orderNo,
      sku: delivery.sku,
      productName: delivery.productName,
      source: delivery.sourceLocation || 'Zone C (Rapid Dispatch)',
      destination: `Customer: ${delivery.customer} (${delivery.destination})`,
      qtyChange: -delivery.qty,
      balanceAfter: newOnHand,
      operator: operatorName || 'Sarah Chen (Manager)',
      note: `Outbound order ${delivery.orderNo} dispatched via ${delivery.carrier}`,
    });
  };

  // 1-Click: Auto-generate Inbound PO to fulfill a backordered delivery
  const triggerPOForDelivery = (orderNo) => {
    const delivery = deliveries.find((d) => d.orderNo === orderNo || d.id === orderNo);
    if (!delivery) return;

    const targetProduct = products.find((p) => p.sku === delivery.sku);
    const poQty = Math.max(delivery.qty * 2, 25);
    const poNum = `PO-BACKORDER-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPO = addReceipt({
      poNumber: poNum,
      supplier: 'Industrial Supplier Co',
      sku: delivery.sku,
      expectedQty: poQty,
      dock: 'Bay 01 - Receiving',
      targetLocation: targetProduct?.primaryLocation || 'Zone C (Rapid Dispatch)',
      carrier: 'Priority Expedited Inflow',
      eta: 'Expedited Priority Arrival',
    });

    setDeliveries((prev) =>
      prev.map((d) =>
        d.orderNo === orderNo || d.id === orderNo
          ? { ...d, linkedPo: poNum, note: `Replenishment PO ${poNum} dispatched (+${poQty} units)` }
          : d
      )
    );

    return newPO;
  };

  // 1-Click: Quick Delivery creation from Product row
  const createDeliveryFromProduct = ({ sku, qty, customer, destination, carrier }) => {
    const prod = products.find((p) => p.sku === sku);
    if (!prod) return;

    return addDelivery({
      orderNo: `SO-${Math.floor(9000 + Math.random() * 900)}`,
      customer: customer || 'Priority Client Corp',
      sku: prod.sku,
      qty: parseInt(qty, 10) || 5,
      sourceLocation: prod.primaryLocation || 'Zone C (Rapid Dispatch)',
      carrier: carrier || 'FedEx Freight Priority',
      destination: destination || 'Chicago, IL, USA',
      deadline: 'Today, EOD',
    });
  };

  // 1-Click: Quick Shift from Product row
  const createTransferFromProduct = ({ sku, qty, fromLocation, toLocation, toWarehouse, reason }) => {
    const prod = products.find((p) => p.sku === sku);
    if (!prod) return;

    return addTransfer({
      transferNo: `TR-${Math.floor(7000 + Math.random() * 2000)}`,
      sku: prod.sku,
      qty: parseInt(qty, 10) || 10,
      fromLocation: fromLocation || prod.primaryLocation,
      toLocation: toLocation || 'Zone C (Rapid Dispatch)',
      fromWarehouse: activeWarehouse?.name || 'WH-01 Main DC (Bay Area)',
      toWarehouse: toWarehouse || 'WH-02 Midwest Regional Logistics Hub',
      reason: reason || 'Inventory balancing from product master',
      priority: 'HIGH',
    });
  };

  // =========================================================================
  // 5. CYCLE ADJUSTMENTS CRUD
  // =========================================================================
  const addAdjustment = (adjData) => {
    const prod = products.find((p) => p.sku === adjData.sku) || products[0];
    const qty = parseInt(adjData.delta, 10) || 0;
    const isPendingApproval = adjData.requiresApproval || adjData.status === 'PENDING_APPROVAL';
    const newOnHand = Math.max(0, prod.onHand + qty);
    const newStatus = newOnHand === 0 ? 'OUT_OF_STOCK' : newOnHand <= prod.minThreshold ? 'LOW_STOCK' : 'IN_STOCK';

    const newAdj = {
      id: `adj-${Date.now().toString().slice(-4)}`,
      adjNumber: adjData.adjNumber || `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
      sku: prod.sku,
      productName: prod.name,
      location: adjData.location || prod.primaryLocation,
      systemQty: adjData.systemQty !== undefined ? adjData.systemQty : prod.onHand,
      physicalQty: adjData.physicalQty !== undefined ? adjData.physicalQty : newOnHand,
      delta: qty,
      reason: adjData.reason || 'Cycle Count Discrepancy',
      operator: adjData.operator || 'Sarah Chen (Manager)',
      approvedBy: isPendingApproval ? null : (adjData.approvedBy || 'Sarah Chen (Manager)'),
      timestamp: 'Just now',
      status: isPendingApproval ? 'PENDING_APPROVAL' : 'APPROVED',
      requiresApproval: isPendingApproval,
      submittedByRole: adjData.submittedByRole || 'WAREHOUSE_STAFF',
    };

    setAdjustments((prev) => [newAdj, ...prev]);

    // If pending approval (submitted by staff), dispatch notification to managers
    if (isPendingApproval) {
      addNotification({
        id: `notif-${Date.now()}`,
        type: 'DISCREPANCY_APPROVAL',
        title: `🚨 Discrepancy Approval Required: ${newAdj.adjNumber}`,
        message: `${newAdj.operator} reported ${newAdj.delta > 0 ? '+' : ''}${newAdj.delta} variance on ${newAdj.productName} (${newAdj.sku}) at ${newAdj.location}. Manager authorization required.`,
        urgency: 'HIGH',
        timestamp: 'Just now',
        read: false,
        referenceNumber: newAdj.adjNumber,
        referenceId: newAdj.id,
        sku: newAdj.sku,
        delta: newAdj.delta,
        targetRole: 'INVENTORY_MANAGER',
      });
    }

    // If immediate approval (Manager), update stock and ledger immediately
    if (!isPendingApproval) {
      setProducts((prev) =>
        prev.map((p) =>
          p.sku === prod.sku ? { ...p, onHand: newOnHand, status: newStatus } : p
        )
      );

      // Append to ledger
      recordLedgerEntry({
        type: 'ADJUSTMENT',
        reference: newAdj.adjNumber,
        sku: newAdj.sku,
        productName: newAdj.productName,
        source: newAdj.location,
        destination: qty < 0 ? 'Scrap Bin / Audit Discrepancy' : 'Physical Recount Inflow',
        qtyChange: qty,
        balanceAfter: newOnHand,
        operator: newAdj.operator,
        note: `Cycle count adjustment: ${newAdj.reason}`,
      });
    }

    return newAdj;
  };

  // Manager approves discrepancy submitted by Warehouse Staff
  const approveAdjustment = (adjId, approverName) => {
    const adj = adjustments.find((a) => a.id === adjId || a.adjNumber === adjId);
    if (!adj) return;

    const prod = products.find((p) => p.sku === adj.sku);
    if (!prod) return;

    const newOnHand = Math.max(0, prod.onHand + adj.delta);
    const newStatus = newOnHand === 0 ? 'OUT_OF_STOCK' : newOnHand <= prod.minThreshold ? 'LOW_STOCK' : 'IN_STOCK';

    // Update product stock
    setProducts((prev) =>
      prev.map((p) =>
        p.sku === prod.sku
          ? {
              ...p,
              onHand: newOnHand,
              available: Math.max(0, newOnHand - (p.allocated || 0)),
              status: newStatus,
            }
          : p
      )
    );

    // Update adjustment status
    setAdjustments((prev) =>
      prev.map((a) =>
        a.id === adjId || a.adjNumber === adjId
          ? {
              ...a,
              status: 'APPROVED',
              approvedBy: approverName || 'Sarah Chen (Manager)',
              approvedAt: 'Just now',
            }
          : a
      )
    );

    // Update linked notification status
    setNotifications((prev) =>
      prev.map((n) =>
        n.referenceNumber === adj.adjNumber || n.referenceId === adj.id
          ? { ...n, read: true, resolved: true, resolvedBy: approverName || 'Sarah Chen (Manager)' }
          : n
      )
    );

    // Record ledger entry
    recordLedgerEntry({
      type: 'ADJUSTMENT',
      reference: adj.adjNumber,
      sku: adj.sku,
      productName: adj.productName,
      source: adj.location,
      destination: adj.delta < 0 ? 'Cycle Discrepancy (Approved)' : 'Physical Recount Inflow (Approved)',
      qtyChange: adj.delta,
      balanceAfter: newOnHand,
      operator: approverName || 'Sarah Chen (Manager)',
      note: `Manager approved staff count discrepancy: ${adj.reason} (Counted: ${adj.physicalQty}, System: ${adj.systemQty})`,
    });

    // Notify staff & system
    addNotification({
      id: `notif-${Date.now()}`,
      type: 'DISCREPANCY_APPROVED',
      title: `✓ Discrepancy ${adj.adjNumber} Approved`,
      message: `${approverName || 'Sarah Chen (Manager)'} approved ${adj.delta > 0 ? '+' : ''}${adj.delta} variance for ${adj.productName} (${adj.sku}). System on-hand & ledger reconciled.`,
      urgency: 'NORMAL',
      timestamp: 'Just now',
      read: false,
      referenceNumber: adj.adjNumber,
      referenceId: adj.id,
      targetRole: 'ALL',
    });
  };

  // Manager rejects discrepancy
  const rejectAdjustment = (adjId, rejectorName, reason) => {
    setAdjustments((prev) =>
      prev.map((a) =>
        a.id === adjId || a.adjNumber === adjId
          ? {
              ...a,
              status: 'REJECTED',
              rejectedBy: rejectorName || 'Sarah Chen (Manager)',
              rejectReason: reason || 'Discrepancy count rejected upon re-verification',
              rejectedAt: 'Just now',
            }
          : a
      )
    );

    setNotifications((prev) =>
      prev.map((n) =>
        n.referenceNumber === adjId || n.referenceId === adjId || n.id === adjId
          ? { ...n, read: true, rejected: true }
          : n
      )
    );

    addNotification({
      id: `notif-${Date.now()}`,
      type: 'DISCREPANCY_REJECTED',
      title: `✕ Discrepancy Rejected: ${adjId}`,
      message: `${rejectorName || 'Sarah Chen (Manager)'} rejected count adjustment: "${reason || 'Count rejected upon re-verification'}".`,
      urgency: 'NORMAL',
      timestamp: 'Just now',
      read: false,
      referenceNumber: adjId,
      targetRole: 'ALL',
    });
  };

  const editAdjustment = (id, updatedData) => {
    setAdjustments((prev) =>
      prev.map((a) => (a.id === id || a.adjNumber === id ? { ...a, ...updatedData } : a))
    );
  };

  const deleteAdjustment = (id) => {
    setAdjustments((prev) => prev.filter((a) => a.id !== id && a.adjNumber !== id));
  };

  // =========================================================================
  // 6. LEDGER DELETION (For testing flexibility)
  // =========================================================================
  const deleteLedgerEntry = (id) => {
    setLedger((prev) => prev.filter((tx) => tx.id !== id));
  };

  // =========================================================================
  // COMPUTED DYNAMIC KPIS
  // =========================================================================
  const totalStockUnits = products.reduce((acc, p) => acc + (p.onHand || 0), 0);
  const totalInventoryValuation = products.reduce((acc, p) => acc + (p.onHand || 0) * (p.unitCost || 0), 0);
  const lowStockCount = products.filter((p) => p.status === 'LOW_STOCK').length;
  const criticalOutCount = products.filter((p) => p.status === 'OUT_OF_STOCK').length;
  const activeInboundPOs = receipts.filter((r) => r.status !== 'RECEIVED').length;
  const inboundUnitsPending = receipts
    .filter((r) => r.status !== 'RECEIVED')
    .reduce((acc, r) => acc + (r.expectedQty || 0), 0);
  const pendingDeliveriesCount = deliveries.filter((d) => d.status !== 'DISPATCHED').length;
  const outboundUnitsPending = deliveries
    .filter((d) => d.status !== 'DISPATCHED')
    .reduce((acc, d) => acc + (d.qty || 0), 0);
  const scheduledTransfersCount = transfers.filter((t) => t.status !== 'COMPLETED').length;
  const transferUnitsScheduled = transfers
    .filter((t) => t.status !== 'COMPLETED')
    .reduce((acc, t) => acc + (t.qty || 0), 0);

  const metrics = {
    totalStockUnits,
    totalInventoryValuation,
    valuationGrowthPct: 4.8,
    lowStockCount,
    criticalOutCount,
    activeInboundPOs,
    inboundUnitsPending,
    pendingDeliveriesCount,
    outboundUnitsPending,
    scheduledTransfersCount,
    transferUnitsScheduled,
    ledgerSyncAccuracy: 99.98,
    totalLedgerEntries: ledger.length,
    warehouseCapacityPct: 69.1,
    dailyFulfillmentSlaPct: 98.4,
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        loadRealData,
        addProduct,
        editProduct,
        deleteProduct,

        receipts,
        addReceipt,
        editReceipt,
        deleteReceipt,
        confirmReceipt,

        transfers,
        addTransfer,
        editTransfer,
        deleteTransfer,
        executeTransfer,
        shiftReceiptToLocation,

        deliveries,
        addDelivery,
        editDelivery,
        deleteDelivery,
        dispatchDelivery,
        advanceDeliveryStatus,
        triggerPOForDelivery,
        createDeliveryFromProduct,
        createTransferFromProduct,

        adjustments,
        addAdjustment,
        editAdjustment,
        deleteAdjustment,
        approveAdjustment,
        rejectAdjustment,

        ledger,
        recordLedgerEntry,
        deleteLedgerEntry,

        zones,
        setZones,

        settings,
        setSettings,

        warehouses,
        setWarehouses,
        activeWarehouse,
        setActiveWarehouse,
        addWarehouse,
        editWarehouse,
        deleteWarehouse,

        suppliers,
        triggerReorderPO,

        notifications,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        clearAllNotifications,

        metrics,
        resetAllData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
