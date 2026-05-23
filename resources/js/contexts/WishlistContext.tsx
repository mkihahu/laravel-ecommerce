import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface WishlistItem {
    id: number;
    product_id: number;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    image: string | null;
    brand: string | null;
}

interface WishlistContextType {
    items: WishlistItem[];
    count: number;
    loading: boolean;
    toggleWishlist: (productId: number) => Promise<boolean>;
    isInWishlist: (productId: number) => boolean;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

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

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const refreshWishlist = async () => {
        try {
            const data = await apiFetch('/wishlist');
            setItems(data.items);
            setCount(data.count);
        } catch {
            setItems([]);
            setCount(0);
        }
    };

    useEffect(() => {
        refreshWishlist();
    }, []);

    const toggleWishlist = async (productId: number): Promise<boolean> => {
        setLoading(true);
        try {
            const data = await apiFetch('/wishlist/toggle', {
                method: 'POST',
                body: JSON.stringify({ product_id: productId }),
            });
            setCount(data.count);
            await refreshWishlist();
            return data.inWishlist;
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const isInWishlist = (productId: number): boolean => {
        return items.some((item) => item.product_id === productId);
    };

    return (
        <WishlistContext.Provider value={{ items, count, loading, toggleWishlist, isInWishlist, refreshWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
