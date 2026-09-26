# StockSense Architecture

Welcome to the **StockSense** Inventory Management System! This document outlines the high-level system architecture, core concepts, components, and data flows that power StockSense.

---

## 🏗 System Architecture Overview

StockSense is designed with a clear separation of concerns, moving from user interactions on the frontend down to the database, with a robust Inventory Engine at its core.

```text
                    ┌───────────────────┐
                    │       USERS       │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │     FRONTEND      │
                    │   (Web App/UI)    │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    REST API       │
                    └─────────┬─────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │        BUSINESS LOGIC         │
              └───────────────┬───────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │      INVENTORY ENGINE         │
              │     (Single Source of Truth)  │
              └───────────────┬───────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    PostgreSQL     │
                    └───────────────────┘
```

---

## 🧩 Key Components

### 1. Frontend / UI
The user interface provides a comprehensive web application for different user roles (Inventory Manager, Warehouse Staff, Admin). 
* **Authentication**: Login, Signup, OTP Password Reset
* **Dashboard**: Total Stock, Low/Out of Stock, Pending Receipts, Pending Deliveries, Scheduled Internal Transfers
* **Products**: Product CRUD, SKU/Code, Category, Unit of Measure, Reorder Rules
* **Operations**: Receipts, Delivery Orders, Internal Transfers, Inventory Adjustments, Move History
* **Warehouse & Locations**: Warehouses, Locations / Racks / Bins
* **Reports & Alerts**: Low Stock Alerts, Stock Reports, Movement Reports
* **Profile / Settings**

### 2. Backend / REST API (Business Logic)
The backend exposes RESTful services to handle the business operations:
* **Authentication Service**: Role & Permission Management, OTP
* **Product Service**: Categories, UOM, Reorder Rules
* **Receipt Service**: Create/Validate receipts, Add Products, Increase Stock
* **Delivery Service**: Create/Validate deliveries, Pick, Pack, Decrease Stock
* **Transfer Service**: Move stock between Source & Destination Locations
* **Adjustment Service**: Physical Count, Compare Stock, Adjust Stock
* **Warehouse Service**: Warehouse and Location Management
* **Dashboard Service**: KPI Calculation, Stock Summary
* **Notification Service**: Low Stock / Reorder Alerts

### 3. Inventory Core (Single Source of Truth)
At the heart of StockSense lies the **Stock Ledger**. It guarantees that all stock calculations are accurate, consistent, and traceable.

```text
  ┌──────────────────┐     ┌────────────────────┐
  │ Stock Balance    │     │ Stock Availability │
  │                  │     │                    │
  │ Product          │     │ Available Stock    │
  │ Warehouse        │     │ Reserved Stock     │
  │ Location         │     │ Reorder Level      │
  │ Quantity         │     │ Available to Pick  │
  └──────────────────┘     └────────────────────┘
```

---

## 📖 The Stock Ledger Principle

**Rule:** Every stock-changing operation **MUST** create a ledger entry. Modules are *not* allowed to modify stock balances directly or calculate their own stock logic.

```text
❌ Delivery module directly changes product.stock
❌ Receipt module maintains its own stock calculation
❌ Transfer module maintains another stock calculation

✅ Operation (Receipt/Delivery/Transfer)
      ↓
   Inventory Service
      ↓
   Stock Ledger
      ↓
   Stock Balance (Updated)
```

### Operation Behaviors on the Ledger:
* **Receipt**: `+ STOCK`
* **Delivery**: `- STOCK`
* **Transfer**: `LOCATION CHANGE` (Total stock unchanged)
* **Adjustment**: `+/- STOCK`

---

## 🔄 Core Workflows

### 1. Inbound & Outbound Supply Chain
```text
      VENDOR
        │
        ▼
   ┌───────────┐
   │  RECEIPT  │
   └─────┬─────┘
         │ (Validate)
         ▼
   ┌───────────┐
   │  STOCK +  │
   └─────┬─────┘
         │
         ▼
  ┌─────────────┐
  │  WAREHOUSE  │
  │  LOCATION A │
  └──────┬──────┘
         │ (Internal Transfer)
         ▼
  ┌─────────────┐
  │  LOCATION B │
  └──────┬──────┘
         │ (Delivery)
         ▼
  ┌─────────────┐
  │ DELIVERY    │
  └──────┬──────┘
         │ (Validate)
         ▼
      STOCK -
         │
         ▼
     CUSTOMER
```

### 2. Inventory Adjustments
```text
   Recorded Stock
         │
         ▼
   Physical Count
         │
         ▼
      Compare
         │
         ├──── Same ────────► No adjustment
         │
         └──── Different ───► Adjustment
                                 │
                                 ▼
                            Stock Ledger
```

---

## 🗄️ Database (PostgreSQL)

The primary data store is PostgreSQL, housing the following core entities:
* Users, Roles
* Products, Categories, UOM
* Suppliers
* Warehouses, Locations
* Receipts, ReceiptItems
* Deliveries, DeliveryItems
* Transfers, TransferItems
* Adjustments, AdjustmentItems
* **StockBalances**, **StockLedger** (Crucial for the engine)
* ReorderRules, Notifications, AuditLogs