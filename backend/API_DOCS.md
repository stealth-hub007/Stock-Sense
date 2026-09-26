# StockSense API Documentation

Since StockSense is built with FastAPI, you get interactive API documentation out of the box! As long as the server is running, you can access the live documentation in two formats:

1. **Swagger UI (Interactive, allows you to test APIs directly from the browser)**
   👉 [http://localhost:8000/docs](http://localhost:8000/docs)
2. **ReDoc (Great for reading static documentation)**
   👉 [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Currently Available Endpoints

#### 📦 Products
| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/products/` | Get a list of all products | **Live** (Connected to DB) |
| `POST` | `/products/` | Create a new product | **Live** (Connected to DB) |
| `POST` | `/products/categories` | Add a category | *Mocked* |
| `POST` | `/products/uom` | Add a unit of measure | *Mocked* |

#### 🔐 Auth (Mocked)
- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/otp`

#### 📥 Receipts (Mocked)
- `POST /receipts/create`
- `POST /receipts/add_products`
- `POST /receipts/validate`

#### 📤 Deliveries (Mocked)
- `POST /deliveries/create`
- `POST /deliveries/pick`
- `POST /deliveries/pack`
- `POST /deliveries/validate`

*(Note: All endpoints are documented dynamically at the `/docs` URL based on our Pydantic schemas)*
