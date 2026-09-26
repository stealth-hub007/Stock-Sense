from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
import enum

class RoleEnum(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    STAFF = "staff"

# --- Users ---
class UserBase(BaseModel):
    username: str
    email: str
    role: RoleEnum = RoleEnum.STAFF

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Category & UOM ---
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UOMBase(BaseModel):
    name: str

class UOMCreate(UOMBase):
    pass

class UOMResponse(UOMBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Suppliers ---
class SupplierBase(BaseModel):
    name: str
    contact_email: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierResponse(SupplierBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Products ---
class ProductBase(BaseModel):
    sku: str
    name: str
    category_id: int
    uom_id: int
    price: float

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    current_stock: int = 0
    model_config = ConfigDict(from_attributes=True)

# --- Warehouses & Locations ---
class WarehouseBase(BaseModel):
    name: str
    address: Optional[str] = None

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseResponse(WarehouseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class LocationBase(BaseModel):
    warehouse_id: int
    name: str
    type: str

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Receipts ---
class ReceiptItemBase(BaseModel):
    product_id: int
    quantity: int

class ReceiptBase(BaseModel):
    supplier_id: int
    status: str = "Draft"

class ReceiptCreate(ReceiptBase):
    items: List[ReceiptItemBase]

class ReceiptResponse(ReceiptBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Deliveries ---
class DeliveryItemBase(BaseModel):
    product_id: int
    quantity: int

class DeliveryBase(BaseModel):
    customer_name: str
    status: str = "Draft"

class DeliveryCreate(DeliveryBase):
    items: List[DeliveryItemBase]

class DeliveryResponse(DeliveryBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Transfers ---
class TransferItemBase(BaseModel):
    product_id: int
    quantity: int

class TransferBase(BaseModel):
    source_location_id: int
    destination_location_id: int
    status: str = "Draft"

class TransferCreate(TransferBase):
    items: List[TransferItemBase]

class TransferResponse(TransferBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Adjustments ---
class AdjustmentItemBase(BaseModel):
    product_id: int
    counted_quantity: int
    theoretical_quantity: int

class AdjustmentBase(BaseModel):
    location_id: int
    status: str = "Draft"

class AdjustmentCreate(AdjustmentBase):
    items: List[AdjustmentItemBase]

class AdjustmentResponse(AdjustmentBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Core Ledger & Balance ---
class StockLedgerResponse(BaseModel):
    id: int
    product_id: int
    location_id: int
    operation_type: str
    quantity: int
    reference_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class StockBalanceResponse(BaseModel):
    id: int
    product_id: int
    location_id: int
    quantity: int
    model_config = ConfigDict(from_attributes=True)

# --- Reorder Rules ---
class ReorderRuleBase(BaseModel):
    product_id: int
    location_id: int
    min_quantity: int
    reorder_quantity: int

class ReorderRuleCreate(ReorderRuleBase):
    pass

class ReorderRuleResponse(ReorderRuleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Notifications & Audit Logs ---
class NotificationBase(BaseModel):
    message: str
    is_read: bool = False

class NotificationResponse(NotificationBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    entity: str
    entity_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
