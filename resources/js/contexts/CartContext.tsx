import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface CartItem {
    id: number;
    product_id: number;
    name: string;
    slug: string;
    price: number;
    quantity: number;
    image: string | null;
    brand: string | null;
    stock: number;
}

interface CartContextType {
    items: CartItem[];
    count: number;
    loading: boolean;
    addToCart: (productId: number, quantity?: number) => Promise<void>;
    removeFromCart: (itemId: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getXSRFToken(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

async function apiFetch(url: string, options?: RequestInit) {
    const method = options?.method ?? 'GET';

    const csrfHeaders: Record<string, string> = {};
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        const token = getXSRFToken();
        if (token) {
            csrfHeaders['X-XSRF-TOKEN'] = token;
        }
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...csrfHeaders,
            ...options?.headers,
        },
        credentials: 'same-origin',
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const refreshCart = async () => {
        try {
            const data = await apiFetch('/cart/data');
            setItems(data.items);
            setCount(data.count);
        } catch {
            setItems([]);
            setCount(0);
        }
    };

    useEffect(() => {
        refreshCart();
    }, []);

    const addToCart = async (productId: number, quantity = 1) => {
        setLoading(true);
        try {
            const data = await apiFetch('/cart', {
                method: 'POST',
                body: JSON.stringify({ product_id: productId, quantity }),
            });
            setCount(data.count);
            await refreshCart();
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId: number) => {
        setLoading(true);
        try {
            const data = await apiFetch(`/cart/${itemId}`, {
                method: 'DELETE',
            });
            setCount(data.count);
            await refreshCart();
        } catch (error) {
            console.error('Failed to remove from cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId: number, quantity: number) => {
        setLoading(true);
        try {
            const data = await apiFetch(`/cart/${itemId}`, {
                method: 'PUT',
                body: JSON.stringify({ quantity }),
            });
            setCount(data.count);
            await refreshCart();
        } catch (error) {
            console.error('Failed to update quantity:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CartContext.Provider value={{ items, count, loading, addToCart, removeFromCart, updateQuantity, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
