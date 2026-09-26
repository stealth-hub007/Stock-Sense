from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models import RoleEnum

class ProductBase(BaseModel):
    sku: str
    name: str
    category: str
    uom: str
    price: float

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    class Config:
        from_attributes = True

class StockBalanceResponse(BaseModel):
    product_id: int
    location_id: int
    quantity: int
    class Config:
        from_attributes = True
