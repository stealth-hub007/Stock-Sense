const API_BASE_URL = 'http://localhost:8000';

export const fetchProducts = async (skip = 0, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/products/?skip=${skip}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
};

export const fetchReceipts = async (skip = 0, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/receipts/?skip=${skip}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch receipts');
    return response.json();
};

export const fetchDeliveries = async (skip = 0, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/deliveries/?skip=${skip}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch deliveries');
    return response.json();
};

export const fetchTransfers = async (skip = 0, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/transfers/?skip=${skip}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch transfers');
    return response.json();
};

export const fetchLedger = async (skip = 0, limit = 50) => {
    // Fallback since we might not have a ledger router yet
    try {
        const response = await fetch(`${API_BASE_URL}/stock_ledger/?skip=${skip}&limit=${limit}`);
        if (response.ok) return response.json();
    } catch (e) {}
    return [];
};

export const createProduct = async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
};
