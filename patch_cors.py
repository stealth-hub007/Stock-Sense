with open("backend/main.py", "r") as f:
    content = f.read()

cors_import = "from fastapi.middleware.cors import CORSMiddleware\n\n"
if "CORSMiddleware" not in content:
    content = content.replace("app = FastAPI", cors_import + "app = FastAPI")

cors_setup = """
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
"""

if "app.add_middleware" not in content:
    content = content.replace("app = FastAPI(title=\"StockSense API\", description=\"API for StockSense Inventory Management System\")", "app = FastAPI(title=\"StockSense API\", description=\"API for StockSense Inventory Management System\")\n" + cors_setup)

with open("backend/main.py", "w") as f:
    f.write(content)
