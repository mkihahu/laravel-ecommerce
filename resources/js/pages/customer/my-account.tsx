import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    User, Package, Heart, ShoppingCart, LogOut, ChevronRight,
    Mail, Phone, Calendar, Clock, CreditCard, MapPinned, Trash2,
    Star, AlertCircle, Plus, Minus, Bell, Save
} from 'lucide-react';
import LandingNavigation from '@/components/landing-navigation';
import LandingFooter from '@/components/landing-footer';
import { storageUrl } from '@/lib/utils';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';

interface NavCategory {
    id: number;
    name: string;
    slug: string;
}

interface OrderLineItem {
    product_id: number;
    name: string;
    slug: string;
    price: number;
    quantity: number;
    total: number;
    image: string | null;
}

interface OrderItem {
    id: number;
    order_number: string;
    total: number;
    status: string;
    payment_status: string;
    items_count: number;
    placed_at: string;
    items: OrderLineItem[];
}

interface WishlistItem {
    id: number;
    product_id: number;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    image: string | null;
    category: string | null;
}

interface CartItem {
    id: number;
    product_id: number;
    name: string;
    slug: string;
    price: number;
    quantity: number;
    image: string | null;
    stock: number;
}

interface Address {
    full_name: string;
    email: string | null;
    phone: string;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    state: string;
    zip_code: string;
    country: string;
}

interface NotificationItem {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

type Tab = 'details' | 'orders' | 'wishlist' | 'profile' | 'cart' | 'notifications';

interface Props {
    navCategories: NavCategory[];
    notifications: NotificationItem[];
    profile: {
        name: string;
        email: string;
        phone: string | null;
        member_since: string;
    };
    orders: OrderItem[];
    wishlistItems: WishlistItem[];
    cartItems: CartItem[];
    billingAddress: Address | null;
    shippingAddress: Address | null;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'details', label: 'My Details', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'cart', label: 'My Cart', icon: ShoppingCart },
];

export default function CustomerMyAccount({ navCategories, notifications, profile, orders, wishlistItems, cartItems, billingAddress, shippingAddress }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('details');
    const { auth, flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <>
            <Head title="My Account - GizmoGrid" />

            <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A]">
                <LandingNavigation canRegister={false} categories={navCategories} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                        <p className="text-gray-500 mt-1">Welcome back, {profile.name}</p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1">
                            <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors border-l-2 ${
                                                activeTab === tab.id
                                                    ? 'bg-orange-50 text-orange-600 border-l-orange-500'
                                                    : 'text-gray-600 hover:bg-gray-50 border-l-transparent'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                                <div className="border-t border-gray-100">
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Logout
                                    </Link>
                                </div>
                            </nav>
                        </div>

                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8">
                                {activeTab === 'details' && <ProfileSection profile={profile} />}
                                {activeTab === 'orders' && <OrdersSection orders={orders} />}
                                {activeTab === 'notifications' && <NotificationsSection items={notifications} />}
                                {activeTab === 'wishlist' && <WishlistSection items={wishlistItems} />}
                                {activeTab === 'profile' && <ProfileAndAddress profile={profile} billing={billingAddress} shipping={shippingAddress} />}
                                {activeTab === 'cart' && <CartSection items={cartItems} />}
                            </div>
                        </div>
                    </div>
                </div>

                <LandingFooter />
            </div>
        </>
    );
}

function ProfileSection({ profile }: { profile: { name: string; email: string; phone: string | null; member_since: string } }) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                    <p className="text-sm text-gray-500">Customer</p>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {profile.name}
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {profile.email}
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {profile.phone || 'Not set'}
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Member Since</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {profile.member_since}
                    </p>
                </div>
            </div>
        </div>
    );
}

function OrdersSection({ orders }: { orders: OrderItem[] }) {
    if (orders.length === 0) {
        return (
            <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">When you place an order, it will appear here.</p>
                <Link href="/collections/all-product" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
                    Start Shopping
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">My Orders</h2>
            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    {order.placed_at}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <Link
                                    key={item.product_id}
                                    href={`/shop/${item.slug}`}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                        <img
                                            src={storageUrl(item.image) || '/images/placeholder-product.jpg'}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-500 transition-colors truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            ${item.price.toFixed(2)} x {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-semibold text-gray-900">${item.total.toFixed(2)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-500">{order.items_count} item(s)</span>
                            <span className="font-bold text-gray-900">${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function WishlistSection({ items: initialItems }: { items: WishlistItem[] }) {
    const [items, setItems] = useState(initialItems);
    const { toggleWishlist } = useWishlist();

    const handleRemove = async (productId: number) => {
        const removed = !(await toggleWishlist(productId));
        if (removed) {
            setItems((prev) => prev.filter((item) => item.product_id !== productId));
            toast.success('Removed from wishlist');
        }
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-6">Save your favorite items here.</p>
                <Link href="/collections/all-product" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
                    Browse Products
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">My Wishlist ({items.length})</h2>
            <div className="grid sm:grid-cols-2 gap-4">
                {items.map((item) => (
                    <div key={item.id} className="relative flex gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow group">
                        <Link href={`/shop/${item.slug}`} className="flex gap-4 flex-1 min-w-0">
                            <div className="h-20 w-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                <img src={storageUrl(item.image) || '/images/placeholder-product.jpg'} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                {item.category && <p className="text-xs text-gray-400 mb-0.5">{item.category}</p>}
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-500 transition-colors truncate">{item.name}</p>
                                {item.sale_price ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-bold text-orange-500">${item.sale_price.toFixed(2)}</span>
                                        <span className="text-xs text-gray-400 line-through">${item.price.toFixed(2)}</span>
                                    </div>
                                ) : (
                                    <p className="font-bold text-gray-900 mt-1">${item.price.toFixed(2)}</p>
                                )}
                            </div>
                        </Link>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(item.product_id); }}
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm"
                            title="Remove from wishlist"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AddressForm({ title, type, address, icon: Icon }: { title: string; type: 'billing' | 'shipping'; address: Address | null; icon: React.ComponentType<{ className?: string }> }) {
    const parts = address?.full_name?.split(' ') || ['', ''];
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    const { data, setData, post, processing, errors } = useForm({
        type,
        first_name: firstName,
        last_name: lastName,
        address: address?.address_line_1 || '',
        city: address?.city || '',
        zip: address?.zip_code || '',
        phone: address?.phone || '',
        email: address?.email || '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/customer/address', {
            onSuccess: () => {},
        });
    }

    return (
        <form onSubmit={handleSubmit} className="border border-gray-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <input
                            type="text"
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            placeholder="First name"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            placeholder="Last name"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                    </div>
                </div>
                <div>
                    <input
                        type="text"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        placeholder="Address"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <input
                            type="text"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                            placeholder="City"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            value={data.zip}
                            onChange={(e) => setData('zip', e.target.value)}
                            placeholder="ZIP / Postal code"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <input
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="Mobile number"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Email address"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-2 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Save className="h-4 w-4" />
                    {processing ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
}

function ProfileForm({ profile }: { profile: Props['profile'] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/customer/profile', {
            onSuccess: () => {},
        });
    }

    return (
        <form onSubmit={handleSubmit} className="border border-gray-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <User className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900">Profile Information</h3>
            </div>
            <div className="space-y-3">
                <div>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Full name"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Email address"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="Phone number"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-2 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Save className="h-4 w-4" />
                    {processing ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
}

function ProfileAndAddress({ profile, billing, shipping }: { profile: Props['profile']; billing: Address | null; shipping: Address | null }) {
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile & Addresses</h2>
            <div className="grid sm:grid-cols-2 gap-6">
                <ProfileForm profile={profile} />
                <AddressForm title="Billing Address" type="billing" address={billing} icon={CreditCard} />
                <AddressForm title="Shipping Address" type="shipping" address={shipping} icon={MapPinned} />
            </div>
        </div>
    );
}

function NotificationsSection({ items }: { items: NotificationItem[] }) {
    const unreadCount = items.filter((n) => !n.is_read).length;

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <Bell className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                {unreadCount > 0 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                        {unreadCount} unread
                    </span>
                )}
            </div>
            <div className="space-y-3">
                {items.map((notification) => (
                    <div
                        key={notification.id}
                        className={`border rounded-xl p-5 transition-shadow hover:shadow-sm ${
                            notification.is_read ? 'border-gray-100' : 'border-orange-200 bg-orange-50/50'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    notification.is_read ? 'bg-gray-100' : 'bg-orange-100'
                                }`}>
                                    <Bell className={`h-5 w-5 ${
                                        notification.is_read ? 'text-gray-400' : 'text-orange-500'
                                    }`} />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-sm ${notification.is_read ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                                        {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {notification.created_at}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CartSection({ items }: { items: CartItem[] }) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <ShoppingCart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some items to your cart.</p>
                <Link href="/collections/all-product" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors">
                    Shop Now
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Cart ({items.length})</h2>
                <Link href="/cart" className="text-sm font-medium text-orange-500 hover:text-orange-600">
                    View Full Cart
                </Link>
            </div>

            <div className="space-y-4 mb-6">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl">
                        <div className="h-20 w-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img src={storageUrl(item.image) || '/images/placeholder-product.jpg'} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Link href={`/shop/${item.slug}`} className="text-sm font-semibold text-gray-900 hover:text-orange-500 transition-colors truncate block">
                                {item.name}
                            </Link>
                            <p className="text-sm font-bold text-orange-500 mt-1">${item.price.toFixed(2)}</p>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                                <span className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-base font-semibold text-gray-900">Subtotal</span>
                    <span className="text-xl font-bold text-orange-500">${subtotal.toFixed(2)}</span>
                </div>
                <Link
                    href="/cart"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                    <ShoppingCart className="h-4 w-4" />
                    Proceed to Checkout
                </Link>
            </div>
        </div>
    );
}
