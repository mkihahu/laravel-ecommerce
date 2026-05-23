import { useState, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ShoppingCart, MapPin, CreditCard, Wallet, Tag, ChevronRight, ArrowLeft, X, StickyNote } from 'lucide-react';
import { storageUrl } from '@/lib/utils';
import LandingNavigation from '@/components/landing-navigation';
import LandingFooter from '@/components/landing-footer';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

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
    stock: number;
}

interface SavedAddress {
    full_name: string;
    email: string | null;
    phone: string;
    address_line_1: string;
    city: string;
    zip_code: string;
}

interface CheckoutProps {
    navCategories: NavCategory[];
    cartItems: CartItem[];
    savedAddress: SavedAddress | null;
    stripeKey: string;
    paypalClientId: string;
}

const paymentMethods = [
    { value: 'cash', label: 'Cash on Delivery', icon: Wallet, desc: 'Pay when your order arrives' },
    { value: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Pay securely with Stripe' },
    { value: 'paypal', label: 'PayPal', icon: Wallet, desc: 'Pay with your PayPal account' },
];

function StripeCardSection({ onReady, cardholderName, onNameChange }: {
    onReady: (stripe: ReturnType<typeof useStripe>, elements: ReturnType<typeof useElements>) => void;
    cardholderName: string;
    onNameChange: (name: string) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();

    useMemo(() => {
        if (stripe && elements) {
            onReady(stripe, elements);
        }
    }, [stripe, elements, onReady]);

    return (
        <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-white space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cardholder Name</label>
                <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
            </div>
            <CardElement
                options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#1A1A1A',
                            '::placeholder': { color: '#9CA3AF' },
                        },
                        invalid: { color: '#EF4444' },
                    },
                }}
            />
        </div>
    );
}

export default function Checkout({ navCategories, cartItems, savedAddress, stripeKey, paypalClientId }: CheckoutProps) {
    const nameParts = savedAddress?.full_name?.split(' ') || ['', ''];
    const savedFirstName = nameParts[0] || '';
    const savedLastName = nameParts.slice(1).join(' ') || '';

    const [paypalProcessing, setPaypalProcessing] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        first_name: savedFirstName,
        last_name: savedLastName,
        address: savedAddress?.address_line_1 || '',
        city: savedAddress?.city || '',
        zip: savedAddress?.zip_code || '',
        phone: savedAddress?.phone || '',
        email: savedAddress?.email || '',
        notes: '',
        payment_method: 'cash',
        coupon_id: 0,
        stripe_payment_intent_id: '',
        paypal_capture_id: '',
    });

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ coupon_id: number; code: string; type: string; discount: number } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [applying, setApplying] = useState(false);
    const [stripeInstance, setStripeInstance] = useState<ReturnType<typeof useStripe> | null>(null);
    const [elementsInstance, setElementsInstance] = useState<ReturnType<typeof useElements> | null>(null);
    const [stripeError, setStripeError] = useState('');
    const [paypalError, setPaypalError] = useState('');
    const [cardholderName, setCardholderName] = useState('');

    const stripePromise = useMemo(() => loadStripe(stripeKey), [stripeKey]);

    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const shipping: number = 0;
    const discount = appliedCoupon?.discount || 0;
    const tax = (subtotal - discount) * 0.1;
    const total = subtotal - discount + shipping + tax;

    const formComplete = data.first_name && data.last_name && data.address && data.city && data.zip && data.phone && data.email && data.payment_method;

    function getXSRFToken(): string | null {
        const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    async function handleApplyCoupon() {
        if (!couponCode.trim()) return;
        setApplying(true);
        setCouponError('');
        const xsrfToken = getXSRFToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        };
        if (xsrfToken) {
            headers['X-XSRF-TOKEN'] = xsrfToken;
        }
        try {
            const res = await fetch('/checkout/coupon', {
                method: 'POST',
                headers,
                body: JSON.stringify({ code: couponCode.trim() }),
                credentials: 'same-origin',
            });
            const result = await res.json();
            if (!res.ok) {
                setCouponError(result.error || 'Failed to apply coupon');
                return;
            }
            setAppliedCoupon(result);
            setData('coupon_id', result.coupon_id);
        } catch {
            setCouponError('Failed to apply coupon. Please try again.');
        } finally {
            setApplying(false);
        }
    }

    function handleRemoveCoupon() {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
        setData('coupon_id', 0);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (data.payment_method === 'card') {
            if (!stripeInstance || !elementsInstance) {
                setStripeError('Payment system not loaded. Please try again.');
                return;
            }

            setStripeError('');

            try {
                const xsrfToken = getXSRFToken();
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                };
                if (xsrfToken) {
                    headers['X-XSRF-TOKEN'] = xsrfToken;
                }

                const res = await fetch('/checkout/payment-intent', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ amount: total }),
                    credentials: 'same-origin',
                });

                if (!res.ok) {
                    setStripeError('Failed to initialize payment. Please try again.');
                    return;
                }

                const { client_secret } = await res.json();

                const cardElement = elementsInstance.getElement(CardElement);
                if (!cardElement) {
                    setStripeError('Card element not found. Please refresh and try again.');
                    return;
                }

                const { error, paymentIntent } = await stripeInstance.confirmCardPayment(client_secret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: cardholderName || undefined,
                        },
                    },
                });

                if (error) {
                    setStripeError(error.message || 'Payment failed. Please try again.');
                    return;
                }

                if (paymentIntent?.status === 'succeeded') {
                    setData('stripe_payment_intent_id', paymentIntent.id);
                    post('/checkout');
                } else {
                    setStripeError('Payment was not completed. Please try again.');
                }
            } catch {
                setStripeError('An unexpected error occurred during payment.');
            }
        } else {
            post('/checkout');
        }
    }

    return (
        <>
            <Head title="Checkout - GizmoGrid" /> 
            <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A]">
                <LandingNavigation categories={navCategories} />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Checkout</h1>
                            <p className="text-sm text-gray-500 mt-1">Review your order and place it</p>
                        </div>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingCart className="h-10 w-10 text-gray-300" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                            <p className="text-gray-500 mb-8">Add some items before checking out</p>
                            <Link
                                href="/collections/all-product"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
                            >
                                Shop Now
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <ShoppingCart className="h-5 w-5 text-orange-500" />
                                            Order Items
                                        </h2>
                                        <div className="divide-y divide-gray-50">
                                            {cartItems.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                                    <div className="h-16 w-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={storageUrl(item.image) || '/images/placeholder-product.jpg'}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <Link href={`/shop/${item.slug}`} className="text-sm font-medium text-gray-900 hover:text-orange-500 transition-colors line-clamp-1">
                                                            {item.name}
                                                        </Link>
                                                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            ${(Number(item.price) * item.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-orange-500" />
                                            Shipping Address
                                        </h2>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                                                <input
                                                    type="text"
                                                    value={data.first_name}
                                                    onChange={(e) => setData('first_name', e.target.value)}
                                                    placeholder="John"
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                    placeholder="Doe"
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                                                <input
                                                    type="text"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    placeholder="123 Main Street, Apt 4B"
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                                                <input
                                                    type="text"
                                                    value={data.city}
                                                    onChange={(e) => setData('city', e.target.value)}
                                                    placeholder="New York"
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP / Postal Code</label>
                                                <input
                                                    type="text"
                                                    value={data.zip}
                                                    onChange={(e) => setData('zip', e.target.value)}
                                                    placeholder="10001"
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                                {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                                                <input
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    placeholder="+1 (555) 123-4567"
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="john@example.com"
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                />
                                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <StickyNote className="h-5 w-5 text-orange-500" />
                                            Order Notes
                                        </h2>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Special instructions, delivery preferences, or anything else we should know..."
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-orange-500" />
                                            Payment Method
                                        </h2>
                                        <div className="space-y-3">
                                            {paymentMethods.map((method) => (
                                                <label
                                                    key={method.value}
                                                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                                                        data.payment_method === method.value
                                                            ? 'border-orange-500 bg-orange-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value={method.value}
                                                        checked={data.payment_method === method.value}
                                                        onChange={() => setData('payment_method', method.value)}
                                                        className="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                                                    />
                                                    <method.icon className={`h-6 w-6 ${
                                                        data.payment_method === method.value ? 'text-orange-500' : 'text-gray-400'
                                                    }`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{method.label}</p>
                                                        <p className="text-xs text-gray-500">{method.desc}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        {data.payment_method === 'card' && stripePromise && (
                                            <Elements stripe={stripePromise}>
                                                <StripeCardSection
                                                    onReady={(stripe, elements) => {
                                                        setStripeInstance(stripe);
                                                        setElementsInstance(elements);
                                                    }}
                                                    cardholderName={cardholderName}
                                                    onNameChange={setCardholderName}
                                                />
                                            </Elements>
                                        )}
                                        {data.payment_method === 'paypal' && paypalClientId && (
                                            <div className="mt-4">
                                                <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'USD' }}>
                                                    <PayPalButtons
                                                        disabled={!formComplete || paypalProcessing}
                                                        createOrder={async () => {
                                                            setPaypalError('');
                                                            setPaypalProcessing(true);
                                                            const xsrfToken = getXSRFToken();
                                                            const headers: Record<string, string> = {
                                                                'Content-Type': 'application/json',
                                                                'Accept': 'application/json',
                                                                'X-Requested-With': 'XMLHttpRequest',
                                                            };
                                                            if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken;
                                                            const res = await fetch('/checkout/paypal/create', {
                                                                method: 'POST', headers,
                                                                body: JSON.stringify({ amount: total }),
                                                                credentials: 'same-origin',
                                                            });
                                                            if (!res.ok) {
                                                                const err = await res.json();
                                                                setPaypalError(err.error || 'Failed to create PayPal order.');
                                                                setPaypalProcessing(false);
                                                                throw new Error(err.error || 'Failed to create order');
                                                            }
                                                            const order = await res.json();
                                                            return order.id;
                                                        }}
                                                        onApprove={async (data) => {
                                                            const xsrfToken = getXSRFToken();
                                                            const headers: Record<string, string> = {
                                                                'Content-Type': 'application/json',
                                                                'Accept': 'application/json',
                                                                'X-Requested-With': 'XMLHttpRequest',
                                                            };
                                                            if (xsrfToken) headers['X-XSRF-TOKEN'] = xsrfToken;
                                                            const res = await fetch('/checkout/paypal/capture', {
                                                                method: 'POST', headers,
                                                                body: JSON.stringify({ order_id: data.orderID }),
                                                                credentials: 'same-origin',
                                                            });
                                                            if (!res.ok) {
                                                                const err = await res.json();
                                                                setPaypalError(err.error || 'PayPal payment failed.');
                                                                setPaypalProcessing(false);
                                                                return;
                                                            }
                                                            const capture = await res.json();
                                                            setData('paypal_capture_id', capture.capture_id);
                                                            setPaypalProcessing(false);
                                                            post('/checkout');
                                                        }}
                                                        onError={() => {
                                                            setPaypalError('PayPal payment encountered an error.');
                                                            setPaypalProcessing(false);
                                                        }}
                                                        onCancel={() => setPaypalProcessing(false)}
                                                    />
                                                </PayPalScriptProvider>
                                                {paypalError && <p className="text-xs text-red-500 mt-2">{paypalError}</p>}
                                            </div>
                                        )}
                                        {stripeError && <p className="text-xs text-red-500 mt-2">{stripeError}</p>}
                                        {errors.payment_method && <p className="text-xs text-red-500 mt-2">{errors.payment_method}</p>}
                                    </div>
                                </div>

                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Subtotal</span>
                                                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Shipping</span>
                                                <span className="font-medium text-gray-900">Free</span>
                                            </div>
                                            {discount > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Discount ({appliedCoupon?.code})</span>
                                                    <span className="font-medium">-${discount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Tax (10%)</span>
                                                <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                                            </div>
                                            <div className="border-t pt-3 flex justify-between">
                                                <span className="text-base font-semibold text-gray-900">Total</span>
                                                <span className="text-base font-bold text-orange-500">${total.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            {appliedCoupon ? (
                                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm font-medium text-green-700">{appliedCoupon.code}</span>
                                                        <span className="text-xs text-green-500">
                                                            (-${appliedCoupon.discount.toFixed(2)})
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveCoupon}
                                                        className="p-1 hover:bg-green-100 rounded-full transition-colors"
                                                    >
                                                        <X className="h-4 w-4 text-green-500" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                                        <Tag className="h-4 w-4 text-orange-500" />
                                                        Have a coupon?
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={couponCode}
                                                            onChange={(e) => setCouponCode(e.target.value)}
                                                            placeholder="Enter code"
                                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleApplyCoupon}
                                                            disabled={applying || !couponCode.trim()}
                                                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {applying ? '...' : 'Apply'}
                                                        </button>
                                                    </div>
                                                    {couponError && (
                                                        <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {data.payment_method !== 'paypal' && (
                                            <button
                                                type="submit"
                                                disabled={processing || !formComplete}
                                                className="w-full mt-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                            >
                                                {processing ? 'Placing Order...' : 'Place Order'}
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        )}
                                        <p className="text-xs text-gray-400 text-center mt-3">
                                            By placing this order, you agree to our Terms & Conditions
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                <LandingFooter />
            </div>
        </>
    );
}
