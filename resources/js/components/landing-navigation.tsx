import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Search,
    Heart,
    ShoppingCart,
    User,
    Menu,
    X,
    ChevronDown,
    Smartphone,
    Laptop,
    Tablet,
    Headphones,
    Camera,
    Gamepad2,
    Home as HomeIcon,
    Cable,
    Grid3x3,
    Trash2,
} from 'lucide-react';
import { register } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { dashboard as staffDashboard } from '@/routes/staff';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { storageUrl } from '@/lib/utils';
import { toast } from 'sonner';

function getDashboardUrl(role: string): string {
    switch (role) {
        case 'admin':
            return adminDashboard();
        case 'staff':
            return staffDashboard();
        case 'customer':
        default:
            return '/customer/my-account';
    }
}

interface NavCategory {
    id: number;
    name: string;
    slug: string;
}

interface LandingNavigationProps {
    canRegister?: boolean;
    categories: NavCategory[];
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    smartphones: Smartphone,
    laptops: Laptop,
    tablets: Tablet,
    audio: Headphones,
    cameras: Camera,
    gaming: Gamepad2,
    'smart-home': HomeIcon,
    accessories: Cable,
};

export default function LandingNavigation({ canRegister = true, categories = [] }: LandingNavigationProps) {
    const { auth } = usePage().props as any;
    const dashboardUrl = auth?.user ? getDashboardUrl(auth.user.role) : '/customer/my-account';
    const { items: cartItems, count: cartCount } = useCart();
    const { items: wishlistItems, count: wishlistCount, toggleWishlist } = useWishlist();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [wishlistOpen, setWishlistOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!dropdownOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-categories-dropdown]')) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [dropdownOpen]);

    useEffect(() => {
        if (!searchOpen) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setSearchQuery('');
            }
        };
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-search-dropdown]')) {
                setSearchOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('keydown', handleEsc);
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [searchOpen]);

    useEffect(() => {
        if (!wishlistOpen) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setWishlistOpen(false);
        };
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-wishlist-dropdown]')) {
                setWishlistOpen(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [wishlistOpen]);

    useEffect(() => {
        if (!cartOpen) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setCartOpen(false);
        };
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-cart-dropdown]')) {
                setCartOpen(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [cartOpen]);

    useEffect(() => {
        if (mobileMenuOpen && searchOpen) {
            setSearchOpen(false);
        }
    }, [mobileMenuOpen]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/collections/all-product', { search: searchQuery.trim() });
        }
    };

    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'New Arrivals', href: '/collections/all-product?sort=newest' },
        { label: 'Best Sellers', href: '/collections/all-product?sort=popular' },
        { label: 'Contact', href: '/contact' },
    ];

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/90 backdrop-blur-md shadow-sm'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    <button
                        className="lg:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>

                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">GizmoGrid</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        <div
                            className="relative"
                            data-categories-dropdown
                        >
                            <button
                                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors group"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDropdownOpen(!dropdownOpen);
                                }}
                            >
                                Browse All Categories
                                <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-100 py-3 z-50">
                                    <div className="px-4 pb-3 mb-2 border-b border-gray-100">
                                        <p className="text-base font-semibold text-gray-900">All Categories</p>
                                        <p className="text-sm text-gray-500">{categories.length} categories</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            href="/collections/all-product"
                                            className="flex items-center gap-4 px-5 py-4 text-base font-semibold text-orange-500 bg-orange-50 hover:bg-orange-100 transition-colors rounded-lg mx-1 col-span-2"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <Grid3x3 className="h-8 w-8" />
                                            <span>All Products</span>
                                        </Link>
                                        {categories.map((category) => {
                                            const Icon = categoryIcons[category.slug] || Grid3x3;
                                            return (
                                                <Link
                                                    key={category.id}
                                                    href={`/collections/${category.slug}`}
                                                    className="flex items-center gap-4 px-5 py-4 text-base text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors rounded-lg mx-1"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <Icon className="h-8 w-8" />
                                                    <span className="font-semibold">{category.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors relative group"
                            >
                                {item.label}
                                {item.label === 'Sale' && (
                                    <span className="absolute -top-1 -right-4 h-4 w-4 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center">!</span>
                                )}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <div className="relative" data-search-dropdown>
                            <button
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchOpen(!searchOpen);
                                }}
                            >
                                <Search className="h-5 w-5 text-gray-600" />
                            </button>

                            {searchOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 bg-black/20 z-40"
                                        onClick={() => {
                                            setSearchOpen(false);
                                            setSearchQuery('');
                                        }}
                                    />
                                    <div className="fixed inset-x-0 top-0 z-50 bg-white shadow-2xl">
                                        <div className="flex items-center justify-between p-4 lg:p-6 border-b">
                                            <p className="text-sm font-semibold text-gray-900">Search Products</p>
                                            <button
                                                onClick={() => {
                                                    setSearchOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <X className="h-5 w-5 text-gray-400" />
                                            </button>
                                        </div>
                                        <form onSubmit={handleSearchSubmit} className="p-4 lg:p-6">
                                            <div className="relative max-w-3xl mx-auto">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="What are you looking for?"
                                                    className="w-full pl-12 pr-28 py-4 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                                                    autoFocus
                                                />
                                                <button
                                                    type="submit"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm"
                                                >
                                                    Search
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="relative" data-wishlist-dropdown>
                            <button
                                onClick={() => setWishlistOpen(!wishlistOpen)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                            >
                                <Heart className="h-5 w-5 text-gray-600" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-orange-500 rounded-full text-white text-[10px] flex items-center justify-center">{wishlistCount}</span>
                                )}
                            </button>

                            {wishlistOpen && (
                                <>
                                    <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setWishlistOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                            <div>
                                                <p className="text-base font-semibold text-gray-900">Wishlist</p>
                                                <p className="text-xs text-gray-500">{wishlistCount} items</p>
                                            </div>
                                            <button
                                                onClick={() => setWishlistOpen(false)}
                                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <X className="h-4 w-4 text-gray-400" />
                                            </button>
                                        </div>

                                        <div className="max-h-80 overflow-y-auto">
                                            {wishlistItems.length === 0 ? (
                                                <div className="py-12 text-center">
                                                    <Heart className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-500">Your wishlist is empty</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-50">
                                                    {wishlistItems.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group">
                                                            <Link
                                                                href={`/shop/${item.slug}`}
                                                                onClick={() => setWishlistOpen(false)}
                                                                className="flex items-center gap-3 flex-1 min-w-0"
                                                            >
                                                                <div className="h-14 w-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                                    <img
                                                                        src={storageUrl(item.image) || '/images/placeholder-product.jpg'}
                                                                        alt={item.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {item.salePrice !== null && item.salePrice !== undefined ? (
                                                                            <>
                                                                                <span className="text-orange-500 font-semibold">${Number(item.salePrice).toFixed(2)}</span>
                                                                                <span className="line-through ml-1">${Number(item.price).toFixed(2)}</span>
                                                                            </>
                                                                        ) : (
                                                                            `$${Number(item.price).toFixed(2)}`
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    await toggleWishlist(item.product_id);
                                                                    toast.success('Removed from wishlist');
                                                                }}
                                                                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {wishlistItems.length > 0 && (
                                            <div className="px-5 py-4 border-t border-gray-100">
                                                <Link
                                                    href="/wishlist"
                                                    onClick={() => setWishlistOpen(false)}
                                                    className="block w-full text-center py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
                                                >
                                                    View Full Wishlist
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="relative" data-cart-dropdown>
                            <button
                                onClick={() => setCartOpen(!cartOpen)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                            >
                                <ShoppingCart className="h-5 w-5 text-gray-600" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-orange-500 rounded-full text-white text-[10px] flex items-center justify-center">{cartCount}</span>
                                )}
                            </button>

                            {cartOpen && (
                                <>
                                    <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setCartOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                            <div>
                                                <p className="text-base font-semibold text-gray-900">Shopping Cart</p>
                                                <p className="text-xs text-gray-500">{cartCount} items</p>
                                            </div>
                                            <button
                                                onClick={() => setCartOpen(false)}
                                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <X className="h-4 w-4 text-gray-400" />
                                            </button>
                                        </div>

                                        <div className="max-h-80 overflow-y-auto">
                                            {cartItems.length === 0 ? (
                                                <div className="py-12 text-center">
                                                    <ShoppingCart className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-500">Your cart is empty</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-50">
                                                    {cartItems.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                                            <Link
                                                                href={`/shop/${item.slug}`}
                                                                onClick={() => setCartOpen(false)}
                                                                className="flex items-center gap-3 flex-1 min-w-0"
                                                            >
                                                                <div className="h-14 w-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                                    <img
                                                                        src={storageUrl(item.image) || '/images/placeholder-product.jpg'}
                                                                        alt={item.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        ${Number(item.price).toFixed(2)} x {item.quantity}
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                            <div className="text-right flex-shrink-0">
                                                                <p className="text-sm font-semibold text-gray-900">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {cartItems.length > 0 && (
                                            <div className="px-5 py-4 border-t border-gray-100 space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Subtotal</span>
                                                    <span className="font-bold text-gray-900">
                                                        ${cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <Link
                                                    href="/cart"
                                                    onClick={() => setCartOpen(false)}
                                                    className="block w-full text-center py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
                                                >
                                                    View Cart & Checkout
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        {auth?.user ? (
                            <Link
                                href={dashboardUrl}
                                className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <User className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">{auth.user.name}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/customer/login"
                                className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <User className="h-5 w-5 text-gray-600" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="lg:hidden bg-white border-t">
                    <nav className="px-4 py-4 space-y-3">
                        <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { router.get('/collections/all-product', { search: searchQuery.trim() }); setMobileMenuOpen(false); } }} className="pb-3 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                                />
                            </div>
                        </form>
                        <div className="pb-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</p>
                            {categories.map((category) => {
                                const Icon = categoryIcons[category.slug] || Grid3x3;
                                return (
                                    <Link
                                        key={category.id}
                                                    href={`/collections/${category.slug}`}
                                        className="flex items-center gap-3 py-3 text-base text-gray-600 hover:text-orange-500"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Icon className="h-6 w-6" />
                                        <span className="font-medium">{category.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="block py-2 text-sm font-medium text-gray-600 hover:text-orange-500"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t flex gap-4">
                            {!auth?.user && (
                                <>
                                    <Link href="/customer/login" className="text-sm font-medium text-gray-600">Log in</Link>
                                    {canRegister && <Link href={register()} className="text-sm font-medium text-orange-500">Register</Link>}
                                </>
                            )}
                            {auth?.user && (
                                <Link href={dashboardUrl} className="text-sm font-medium text-orange-500">My Account</Link>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
