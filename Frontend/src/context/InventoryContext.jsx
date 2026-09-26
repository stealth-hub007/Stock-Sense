import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_LEDGER,
  INITIAL_RECEIPTS_QUEUE,
  INITIAL_TRANSFERS_QUEUE,
  INITIAL_DELIVERIES_QUEUE,
  INITIAL_ADJUSTMENTS,
  INITIAL_ZONES,
  INITIAL_SETTINGS,
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
};

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

  // Sync state to localStorage whenever modified
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

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
        };
      })
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id && p.sku !== id));
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
      status: 'READY_TO_RECEIVE',
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

    // Update product stock
    setProducts((prev) =>
      prev.map((p) =>
        p.sku === receipt.sku
          ? { ...p, onHand: newOnHand, available: newOnHand - p.allocated, status: newStatus }
          : p
      )
    );

    // Update receipt status
    setReceipts((prev) =>
      prev.map((r) =>
        r.poNumber === poNumber || r.id === poNumber
          ? { ...r, status: 'RECEIVED', receivedAt: 'Just now', receivedBy: operatorName || 'Sarah Chen (Manager)' }
          : r
      )
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
      note: `Inbound PO arrival validated and put away`,
    });
  };

  // =========================================================================
  // 3. INTERNAL TRANSFERS CRUD & EXECUTION
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
      priority: transferData.priority || 'HIGH',
      reason: transferData.reason || 'Buffer replenishment',
      status: 'SCHEDULED',
      requestedBy: transferData.requestedBy || 'Sarah Chen (Manager)',
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

    // Append to ledger
    recordLedgerEntry({
      type: 'TRANSFER',
      reference: transfer.transferNo,
      sku: transfer.sku,
      productName: transfer.productName,
      source: transfer.fromLocation,
      destination: transfer.toLocation,
      qtyChange: transfer.qty,
      isRelocation: true,
      balanceAfter: targetProduct.onHand,
      operator: operatorName || 'Sarah Chen (Manager)',
      note: `Relocated ${transfer.qty} units: ${transfer.fromLocation} → ${transfer.toLocation}`,
    });
  };

  // =========================================================================
  // 4. DELIVERY ORDERS CRUD & DISPATCH
  // =========================================================================
  const addDelivery = (deliveryData) => {
    const prod = products.find((p) => p.sku === deliveryData.sku) || products[0];
    const newDelivery = {
      id: `del-${Date.now().toString().slice(-4)}`,
      orderNo: deliveryData.orderNo || `SO-${Math.floor(9000 + Math.random() * 1000)}`,
      customer: deliveryData.customer || 'Commercial Client Corp',
      sku: prod.sku,
      productName: prod.name,
      qty: parseInt(deliveryData.qty, 10) || 5,
      sourceLocation: deliveryData.sourceLocation || 'Zone C (Rapid Dispatch)',
      carrier: deliveryData.carrier || 'FedEx Freight Priority',
      deadline: deliveryData.deadline || 'Today, EOD',
      destination: deliveryData.destination || 'Chicago, IL, USA',
      status: 'READY_TO_DISPATCH',
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

  // Immediate causal stock decrement upon order dispatch
  const dispatchDelivery = (orderNo, operatorName) => {
    const delivery = deliveries.find((d) => d.orderNo === orderNo || d.id === orderNo);
    if (!delivery) return;

    const targetProduct = products.find((p) => p.sku === delivery.sku);
    if (!targetProduct) return;

    const newOnHand = Math.max(0, targetProduct.onHand - delivery.qty);
    const newStatus = newOnHand === 0 ? 'OUT_OF_STOCK' : newOnHand <= targetProduct.minThreshold ? 'LOW_STOCK' : 'IN_STOCK';

    // Update product stock
    setProducts((prev) =>
      prev.map((p) =>
        p.sku === delivery.sku
          ? { ...p, onHand: newOnHand, available: Math.max(0, newOnHand - p.allocated), status: newStatus }
          : p
      )
    );

    // Update delivery status
    setDeliveries((prev) =>
      prev.map((d) =>
        d.orderNo === orderNo || d.id === orderNo
          ? { ...d, status: 'DISPATCHED', dispatchedAt: 'Just now' }
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
      destination: `Customer: ${delivery.customer}`,
      qtyChange: -delivery.qty,
      balanceAfter: newOnHand,
      operator: operatorName || 'Sarah Chen (Manager)',
      note: `Outbound order ${delivery.orderNo} dispatched via ${delivery.carrier}`,
    });
  };

  // =========================================================================
  // 5. CYCLE ADJUSTMENTS CRUD
  // =========================================================================
  const addAdjustment = (adjData) => {
    const prod = products.find((p) => p.sku === adjData.sku) || products[0];
    const qty = parseInt(adjData.delta, 10) || 0;
    const newOnHand = Math.max(0, prod.onHand + qty);
    const newStatus = newOnHand === 0 ? 'OUT_OF_STOCK' : newOnHand <= prod.minThreshold ? 'LOW_STOCK' : 'IN_STOCK';

    const newAdj = {
      id: `adj-${Date.now().toString().slice(-4)}`,
      adjNumber: adjData.adjNumber || `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
      sku: prod.sku,
      productName: prod.name,
      location: adjData.location || prod.primaryLocation,
      systemQty: prod.onHand,
      physicalQty: newOnHand,
      delta: qty,
      reason: adjData.reason || 'Cycle Count Discrepancy',
      operator: adjData.operator || 'Sarah Chen (Manager)',
      approvedBy: adjData.approvedBy || 'Sarah Chen (Manager)',
      timestamp: 'Just now',
      status: 'APPROVED',
    };

    // Update product count
    setProducts((prev) =>
      prev.map((p) =>
        p.sku === prod.sku ? { ...p, onHand: newOnHand, status: newStatus } : p
      )
    );

    setAdjustments((prev) => [newAdj, ...prev]);

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

    return newAdj;
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

        deliveries,
        addDelivery,
        editDelivery,
        deleteDelivery,
        dispatchDelivery,

        adjustments,
        addAdjustment,
        editAdjustment,
        deleteAdjustment,

        ledger,
        recordLedgerEntry,
        deleteLedgerEntry,

        zones,
        setZones,

        settings,
        setSettings,

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
