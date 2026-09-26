# StockSense — Enterprise WMS

StockSense is an advanced, full-stack Enterprise Warehouse Management System designed to handle real-time inventory control, multi-warehouse management, and role-based access.

## Features & Architecture

* **Frontend:** React + Vite, built with modern JavaScript and vanilla CSS to ensure high performance and an extremely polished, premium user interface. It utilizes a state-based internal router tailored specifically for Role-Based Access Control (RBAC).
* **Backend:** FastAPI (Python) providing a highly concurrent, asynchronous RESTful API.
* **Database:** PostgreSQL accessed asynchronously via SQLAlchemy, ensuring data consistency and reliability across operations.
* **Role-Based Access Control (RBAC):** Three distinct layers of access:
  * **Admin:** Full system configuration, user approval, and global visibility.
  * **Inventory Manager:** Multi-warehouse control, ledger visibility, and approval workflows.
  * **Warehouse Staff:** Restricted solely to the operational "Staff Floor" for immediate tasks (Receipts, Deliveries, Transfers, Adjustments).

## How We Solved the Challenges
During development, we faced challenges merging divergent frontend codebases (a fully-fledged staff UI vs a newly developed admin dashboard). We successfully:
1. **Resolved Complex Merge Conflicts:** Using targeted regex scripts and manual AST-level fixes, we merged the `Frontend` branch into the main workflow without breaking the React Router state or duplicate UI components.
2. **Unified Data State:** Removed hardcoded mock data and replaced it with a live `InventoryContext` and `AuthContext` that talks directly to our PostgreSQL database via our FastAPI backend.
3. **Secured the App:** Implemented a backend authentication route and securely restricted "Staff" level users from accessing administrative or managerial panels.

## Setup & Running Locally

### 1. Backend Setup
Navigate to the `backend` directory, create a virtual environment, install dependencies, and start the FastAPI server:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
*The backend will run on `http://localhost:8000`*

### 2. Database Seeding
To initialize the system with the proper roles and test credentials, run the seed script:
```bash
cd backend
source venv/bin/activate
python3 seed_auth.py
```

### 3. Frontend Setup
Navigate to the `Frontend` directory, install NPM dependencies, and start the Vite development server:
```bash
cd Frontend
npm install
npm run dev -- --port 5174
```
*The frontend will run on `http://localhost:5174`*

## Testing Credentials

The database has been seeded with the following user accounts mapped to different dashboard experiences:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@stocksense.com` | `admin123` |
| **Manager** | `manager@stocksense.com` | `manager123` |
| **Staff** | `staff@stocksense.com` | `staff123` |

Enjoy exploring StockSense!