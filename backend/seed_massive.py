import asyncio
import random
from datetime import datetime, timedelta
from database import engine, async_session_maker
import models
from sqlalchemy import text

REALISTIC_PRODUCTS = [
    ("Wireless Noise-Canceling Headphones", "Electronics", 299.99, "Piece"),
    ("Mechanical Gaming Keyboard", "Electronics", 149.50, "Piece"),
    ("Ergonomic Office Chair", "Furniture", 249.00, "Piece"),
    ("Adjustable Standing Desk", "Furniture", 499.99, "Piece"),
    ("4K Ultra HD Smart TV - 65 inch", "Electronics", 899.00, "Piece"),
    ("Stainless Steel Water Bottle 32oz", "Accessories", 24.99, "Piece"),
    ("Organic Arabica Coffee Beans", "Grocery", 18.50, "Kg"),
    ("Premium Matcha Green Tea Powder", "Grocery", 29.99, "Kg"),
    ("Yoga Mat with Alignment Lines", "Fitness", 35.00, "Piece"),
    ("Adjustable Dumbbells Set (50 lbs)", "Fitness", 199.99, "Piece"),
    ("Smart LED Light Bulbs (4-Pack)", "Home & Kitchen", 45.00, "Box"),
    ("Robot Vacuum Cleaner", "Home & Kitchen", 299.00, "Piece"),
    ("Bluetooth Portable Speaker", "Electronics", 89.99, "Piece"),
    ("Portable Power Bank 20000mAh", "Electronics", 49.99, "Piece"),
    ("USB-C Fast Charging Cable 6ft", "Accessories", 15.00, "Piece"),
    ("Leather Laptop Messenger Bag", "Accessories", 129.99, "Piece"),
    ("Men's Running Shoes", "Apparel", 120.00, "Piece"),
    ("Women's High-Waisted Leggings", "Apparel", 45.00, "Piece"),
    ("Winter Fleece Jacket", "Apparel", 85.00, "Piece"),
    ("Polarized Sunglasses", "Accessories", 65.00, "Piece"),
    ("Skincare Hydrating Face Serum", "Beauty", 38.00, "Piece"),
    ("SPF 50 Sunscreen Lotion", "Beauty", 22.00, "Piece"),
    ("Electric Toothbrush", "Beauty", 79.99, "Piece"),
    ("Non-Stick Cookware Set (10-Piece)", "Home & Kitchen", 149.00, "Box"),
    ("Cast Iron Skillet 12-inch", "Home & Kitchen", 45.00, "Piece"),
    ("Digital Air Fryer 5.8QT", "Home & Kitchen", 119.99, "Piece"),
    ("Espresso Machine with Milk Frother", "Home & Kitchen", 450.00, "Piece"),
    ("Organic Virgin Coconut Oil", "Grocery", 12.99, "Liter"),
    ("Himalayan Pink Salt", "Grocery", 8.50, "Kg"),
    ("Whey Protein Isolate - Vanilla", "Fitness", 55.00, "Kg"),
    ("Pre-Workout Energy Powder", "Fitness", 35.00, "Piece"),
    ("Resistance Bands Set", "Fitness", 25.00, "Piece"),
    ("Foam Roller for Muscle Massage", "Fitness", 30.00, "Piece"),
    ("Hardcover Lined Notebook", "Office Supplies", 18.00, "Piece"),
    ("Gel Ink Pens (12-Pack)", "Office Supplies", 14.50, "Box"),
    ("Desktop Organizer", "Office Supplies", 28.00, "Piece"),
    ("Wireless Ergonomic Mouse", "Electronics", 55.00, "Piece"),
    ("27-inch IPS Monitor 144Hz", "Electronics", 320.00, "Piece"),
    ("Webcam 1080p with Microphone", "Electronics", 65.00, "Piece"),
    ("Noise-Isolating Earbuds", "Electronics", 45.00, "Piece"),
    ("Smartphone Gimbal Stabilizer", "Electronics", 99.00, "Piece"),
    ("Mirrorless Digital Camera", "Electronics", 1200.00, "Piece"),
    ("Camera Tripod Stand", "Photography", 45.00, "Piece"),
    ("Ring Light with Stand 10-inch", "Photography", 35.00, "Piece"),
    ("Canvas Wall Art Set of 3", "Home Decor", 75.00, "Box"),
    ("Aromatherapy Essential Oil Diffuser", "Home Decor", 29.99, "Piece"),
    ("Plush Throw Blanket", "Home Decor", 35.00, "Piece"),
    ("Ceramic Plant Pots (Set of 2)", "Home Decor", 25.00, "Piece"),
    ("Outdoor Solar Pathway Lights", "Garden", 49.99, "Box"),
    ("Heavy Duty Garden Hose 50ft", "Garden", 39.00, "Piece")
]

SUPPLIER_NAMES = [
    "TechGlobal Solutions",
    "Apex Manufacturing Ltd",
    "Green Valley Organics",
    "Prime Essentials Co.",
    "Summit Fitness Gear",
    "HomeCraft Distributions",
    "OfficePro Supplies",
    "EcoLife Products",
    "Visionary Electronics",
    "Daily Goods Wholesale"
]

CUSTOMER_NAMES = [
    "Acme Corp", "Globex Corporation", "Stark Industries", "Wayne Enterprises",
    "Umbrella Corporation", "Massive Dynamic", "Initech", "Soylent Corp",
    "Cyberdyne Systems", "LexCorp", "Oceanic Airlines", "Virtucon",
    "Bluth Company", "Buy n Large", "Hooli", "Pied Piper",
    "Dunder Mifflin", "Vandelay Industries", "Los Pollos Hermanos", "Goliath National Bank"
]

async def seed():
    async with async_session_maker() as session:
        print("Cleaning up database...")
        # Wiping tables for clean seed
        tables = [
            "audit_logs", "notifications", "reorder_rules", "stock_balances", "stock_ledger",
            "adjustment_items", "adjustments", "transfer_items", "transfers",
            "delivery_items", "deliveries", "receipt_items", "receipts",
            "locations", "warehouses", "products", "suppliers", "uom", "categories", "users"
        ]
        for t in tables:
            await session.execute(text(f"TRUNCATE TABLE {t} RESTART IDENTITY CASCADE"))
        await session.commit()
        
        print("Seeding realistic data...")
        
        # 1. Categories
        unique_categories = list(set([p[1] for p in REALISTIC_PRODUCTS]))
        cat_map = {}
        for c in unique_categories:
            cat = models.Category(name=c)
            session.add(cat)
            cat_map[c] = cat
        
        # 2. UOMs
        unique_uoms = list(set([p[3] for p in REALISTIC_PRODUCTS]))
        uom_map = {}
        for u in unique_uoms:
            uom = models.UOM(name=u)
            session.add(uom)
            uom_map[u] = uom
            
        await session.commit()
        
        # Refresh maps
        for c in cat_map.values():
            await session.refresh(c)
        for u in uom_map.values():
            await session.refresh(u)
        
        # 3. Warehouses & Locations
        wh = models.Warehouse(name="Main DC (Bay Area)", address="100 Silicon Way, San Jose")
        wh2 = models.Warehouse(name="East Coast Hub", address="200 Broadway, NY")
        session.add_all([wh, wh2])
        await session.commit()
        await session.refresh(wh)
        await session.refresh(wh2)
        
        locations = []
        for i in range(1, 13):
            loc = models.Location(warehouse_id=wh.id, name=f"Rack A-{i:02d}", type="Internal")
            session.add(loc)
            locations.append(loc)
        for i in range(1, 6):
            loc = models.Location(warehouse_id=wh2.id, name=f"Rack B-{i:02d}", type="Internal")
            session.add(loc)
            locations.append(loc)
        await session.commit()
        
        # 4. Products
        products = []
        for i, (name, cat_name, price, uom_name) in enumerate(REALISTIC_PRODUCTS):
            prod = models.Product(
                sku=f"SKU-{10000+i}",
                name=name,
                category_id=cat_map[cat_name].id,
                uom_id=uom_map[uom_name].id,
                price=price
            )
            session.add(prod)
            products.append(prod)
        await session.commit()
        for p in products:
            await session.refresh(p)

        # 5. Suppliers
        suppliers = []
        for name in SUPPLIER_NAMES:
            sup = models.Supplier(name=name, contact_email=f"sales@{name.lower().replace(' ', '')}.com")
            session.add(sup)
            suppliers.append(sup)
        await session.commit()
        for s in suppliers:
            await session.refresh(s)
            
        # 6. Balances & Ledger
        for i in range(50):
            prod = products[i]
            loc = random.choice(locations)
            sup = random.choice(suppliers)
            
            # Make ~10% of items low stock or out of stock to show on dashboard
            is_low_stock = random.random() < 0.15
            qty = random.randint(0, 5) if is_low_stock else random.randint(20, 500)
            
            # Balance
            bal = models.StockBalance(product_id=prod.id, location_id=loc.id, quantity=qty)
            session.add(bal)
            
            # Receipt (Historical)
            rec = models.Receipt(supplier_id=sup.id, status="Validated")
            session.add(rec)
            await session.flush()
            
            rec_item = models.ReceiptItem(receipt_id=rec.id, product_id=prod.id, quantity=qty + random.randint(10, 50))
            session.add(rec_item)
            
            # Ledger Entry (In)
            ledger_in = models.StockLedger(
                product_id=prod.id, 
                location_id=loc.id, 
                operation_type="RECEIPT", 
                quantity=qty + 20, 
                reference_id=f"REC-{rec.id}"
            )
            session.add(ledger_in)
            
            # Random Delivery (Out)
            customer = random.choice(CUSTOMER_NAMES)
            deliv_status = random.choice(["Draft", "Packed", "Shipped"])
            deliv = models.Delivery(customer_name=customer, status=deliv_status)
            session.add(deliv)
            await session.flush()
            
            deliv_qty = random.randint(1, 10)
            deliv_item = models.DeliveryItem(delivery_id=deliv.id, product_id=prod.id, quantity=deliv_qty)
            session.add(deliv_item)
            
            if deliv_status == "Shipped":
                ledger_out = models.StockLedger(
                    product_id=prod.id, 
                    location_id=loc.id, 
                    operation_type="DELIVERY", 
                    quantity=-deliv_qty, 
                    reference_id=f"DEL-{deliv.id}"
                )
                session.add(ledger_out)

            # Random Internal Transfer
            if random.random() < 0.3:
                transfer_status = random.choice(["Draft", "Completed"])
                transfer = models.Transfer(
                    source_location_id=loc.id,
                    destination_location_id=random.choice(locations).id,
                    status=transfer_status
                )
                session.add(transfer)
                await session.flush()
                
                transfer_item = models.TransferItem(transfer_id=transfer.id, product_id=prod.id, quantity=random.randint(1, 5))
                session.add(transfer_item)
            
        await session.commit()
        print("Realistic seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
