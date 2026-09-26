from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth
from routers import products
from routers import receipts
from routers import deliveries
from routers import transfers
from routers import adjustments
from routers import warehouses
from routers import dashboard
from routers import notifications
from routers import ledger

app = FastAPI(title="StockSense API", description="API for StockSense Inventory Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(receipts.router)
app.include_router(deliveries.router)
app.include_router(transfers.router)
app.include_router(adjustments.router)
app.include_router(warehouses.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(ledger.router)

@app.get("/")
async def root():
    return {"message": "Welcome to StockSense API"}
