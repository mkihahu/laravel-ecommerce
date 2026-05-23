import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { Trash2, ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { storageUrl } from '@/lib/utils';
import LandingNavigation from '@/components/landing-navigation';
import LandingFooter from '@/components/landing-footer';

interface NavCategory {
    id: number;
    name: string;
    slug: string;
}

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

interface CartPageProps {
    items: CartItem[];
    count: number;
    navCategories: NavCategory[];
}

export default function CartPage({ items: initialItems, count: initialCount, navCategories }: CartPageProps) {
    const { items: contextItems, count: contextCount, updateQuantity, removeFromCart, loading } = useCart();
    const mounted = useRef(false);

    useEffect(() => {
        mounted.current = true;
    }, []);

    const items = mounted.current ? contextItems : initialItems;
    const itemCount = mounted.current ? contextCount : initialCount;
    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    return (
        <>
            <Head title="Shopping Cart - GizmoGrid" /> 
            <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A]">
                <LandingNavigation categories={navCategories} />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Shopping Cart</h1>
                            <p className="text-sm text-gray-500 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingCart className="h-10 w-10 text-gray-300" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
                            <Link
                                href="/collections/all-product"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
                            >
                                Shop Now
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                                    <Link href={`/shop/${item.slug}`} className="h-20 w-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                        <img
                                            src={storageUrl(item.image) || '/images/placeholder-product.jpg'}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/shop/${item.slug}`} className="text-sm font-medium text-gray-900 hover:text-orange-500 transition-colors line-clamp-1">
                                            {item.name}
                                        </Link>
                                        {item.brand && (
                                            <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>
                                        )}
                                        <p className="text-sm font-semibold text-gray-900 mt-1">
                                            ${(Number(item.price) * item.quantity).toFixed(2)}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex items-center border border-gray-200 rounded-lg">
                                                <button
                                                    onClick={() => {
                                                        if (item.quantity > 1) {
                                                            updateQuantity(item.id, item.quantity - 1);
                                                        }
                                                    }}
                                                    disabled={loading || item.quantity <= 1}
                                                    className="p-1.5 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                                >
                                                    <Minus className="h-3.5 w-3.5 text-gray-500" />
                                                </button>
                                                <span className="px-3 text-sm font-medium text-gray-900 min-w-[24px] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        if (item.quantity < item.stock) {
                                                            updateQuantity(item.id, item.quantity + 1);
                                                        }
                                                    }}
                                                    disabled={loading || item.quantity >= item.stock}
                                                    className="p-1.5 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5 text-gray-500" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                disabled={loading}
                                                className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 hidden sm:block">
                                        <p className="text-xs text-gray-400">Unit Price</p>
                                        <p className="text-sm font-medium text-gray-600">${Number(item.price).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-base text-gray-600">Subtotal</span>
                                    <span className="text-xl font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-6">Shipping and taxes calculated at checkout</p>
                                <Link
                                    href="/checkout"
                                    className="block w-full text-center py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                                >
                                    Proceed to Checkout
                                </Link>
                                <Link
                                    href="/collections/all-product"
                                    className="block w-full text-center mt-3 py-3 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <LandingFooter />
            </div>
        </>
    );
}
