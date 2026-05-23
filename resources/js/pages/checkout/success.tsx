import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { CheckCircle, Package, ChevronRight, ShoppingBag, User, MapPin, CreditCard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { storageUrl } from '@/lib/utils';
import LandingNavigation from '@/components/landing-navigation';
import LandingFooter from '@/components/landing-footer';

interface NavCategory {
    id: number;
    name: string;
    slug: string;
}

interface OrderItemData {
    id: number;
    product_id: number;
    name: string;
    slug: string;
    quantity: number;
    price: number;
    total: number;
    image: string | null;
}

interface OrderData {
    id: number;
    order_number: string;
    subtotal: number;
    discount: number;
    shipping_fee: number;
    tax: number;
    total: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
    placed_at: string;
    items: OrderItemData[];
    shipping_address: {
        full_name: string;
        address_line_1: string;
        city: string;
        zip_code: string;
    };
}

interface SuccessProps {
    navCategories: NavCategory[];
    order: OrderData;
}

export default function CheckoutSuccess({ navCategories, order }: SuccessProps) {
    const { refreshCart } = useCart();

    useEffect(() => {
        refreshCart();
    }, []);

    const paymentLabel: Record<string, string> = {
        cash: 'Cash on Delivery',
        card: 'Credit / Debit Card',
        paypal: 'PayPal',
    };

    return (
        <>
            <Head title="Order Confirmed" />
            <div className="min-h-screen bg-gray-50">
                <LandingNavigation categories={navCategories} />

                <div className="max-w-2xl mx-auto px-4 py-12">
                    <div className="text-center mb-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
                        <p className="text-gray-500 mt-2">
                            Thank you for your purchase. Your order has been placed successfully.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-gray-400" />
                                <span className="font-semibold text-gray-900">Order #{order.order_number}</span>
                            </div>
                            <span className="text-sm text-gray-500">{order.placed_at}</span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 py-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <img src={storageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Package className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                                    </div>
                                    <span className="font-medium text-gray-900">${item.total.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-${order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Shipping</span>
                                <span>{order.shipping_fee > 0 ? `$${order.shipping_fee.toFixed(2)}` : 'Free'}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Tax</span>
                                <span>${order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
                                <span>Total</span>
                                <span>${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="font-semibold text-gray-900 mb-3">Shipping Details</h2>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span>{order.shipping_address.full_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span>{order.shipping_address.address_line_1}, {order.shipping_address.city} {order.shipping_address.zip_code}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-gray-400" />
                                <span>{paymentLabel[order.payment_method] || order.payment_method}</span>
                                {order.payment_status === 'paid' && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Paid</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/customer/my-account"
                                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors text-center"
                            >
                                View My Orders
                            </Link>
                            <Link
                                href="/"
                                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors text-center flex items-center justify-center gap-1"
                            >
                                Continue Shopping <ChevronRight className="h-4 w-4" />
                            </Link>
                    </div>
                </div>

                <LandingFooter />
            </div>
        </>
    );
}
