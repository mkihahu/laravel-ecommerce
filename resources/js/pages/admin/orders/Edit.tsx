import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Save, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { storageUrl } from '@/lib/utils';

interface OrderItem {
    id: number;
    product: { id: number; name: string; sku: string; thumbnail: string | null } | null;
    quantity: number;
    price: string;
    total: string;
}

interface Payment {
    id: number;
    payment_method: string;
    transaction_id: string | null;
    amount: string;
    currency: string;
    status: string;
    paid_at: string | null;
}

interface Address {
    id: number;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string | null;
}

interface Order {
    id: number;
    order_number: string;
    user: { id: number; name: string; email: string } | null;
    address: Address | null;
    subtotal: string;
    discount: string;
    shipping_fee: string;
    tax: string;
    total: string;
    order_status: string;
    payment_status: string;
    notes: string | null;
    placed_at: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
    payment: Payment[];
}

interface Props {
    order: Order;
}

function formatCurrency(amount: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(parseFloat(amount));
}

function formatDate(date: string | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function OrderStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
        <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}

function PaymentStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };

    return (
        <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}

const trackingSteps = [
    { status: 'pending', label: 'Order Placed', icon: Package },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: MapPin },
];

export default function EditOrder() {
    const { props } = usePage<Props>();
    const { order } = props;

    const [formData, setFormData] = useState({
        order_status: order.order_status,
        payment_status: order.payment_status,
        notes: order.notes || '',
        tracking_number: order.tracking_number || '',
        tracking_url: order.tracking_url || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(`/admin/orders/${order.id}`, formData, {
            onSuccess: () => {
                toast.success('Order updated successfully');
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    const currentStatusIndex = trackingSteps.findIndex((s) => s.status === formData.order_status);
    const isCancelled = formData.order_status === 'cancelled';

    return (
        <>
            <Head title={`Edit Order ${order.order_number}`} />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Edit Order {order.order_number}</h1>
                            <p className="text-muted-foreground">Update order status and tracking</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Order Tracking</h2>

                                {isCancelled ? (
                                    <div className="text-center py-8">
                                        <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">Order Cancelled</Badge>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                                        <div className="space-y-6 relative">
                                            {trackingSteps.map((step, index) => {
                                                const isCompleted = index <= currentStatusIndex;
                                                const isCurrent = index === currentStatusIndex;
                                                const Icon = step.icon;

                                                return (
                                                    <div key={step.status} className="flex items-center gap-4">
                                                        <div
                                                            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                                                                isCompleted
                                                                    ? 'bg-green-500 text-white'
                                                                    : 'bg-gray-200 text-gray-500'
                                                            }`}
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`font-medium ${isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                                {step.label}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border bg-card p-6">
                                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                                            {item.product?.thumbnail ? (
                                                <img
                                                    src={storageUrl(item.product.thumbnail)}
                                                    alt={item.product.name}
                                                    className="h-16 w-16 rounded-lg object-cover border flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                                                <p className="text-sm text-muted-foreground">SKU: {item.product?.sku || 'N/A'}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                                            </div>
                                            <p className="font-semibold whitespace-nowrap">{formatCurrency(item.total)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Update Status</h2>

                                <div className="space-y-2">
                                    <Label>Order Status</Label>
                                    <Select
                                        value={formData.order_status}
                                        onValueChange={(value) => handleInputChange('order_status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Payment Status</Label>
                                    <Select
                                        value={formData.payment_status}
                                        onValueChange={(value) => handleInputChange('payment_status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                            <SelectItem value="refunded">Refunded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tracking_number">Tracking Number</Label>
                                    <Input
                                        id="tracking_number"
                                        value={formData.tracking_number}
                                        onChange={(e) => handleInputChange('tracking_number', e.target.value)}
                                        placeholder="Enter tracking number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tracking_url">Tracking URL</Label>
                                    <Input
                                        id="tracking_url"
                                        type="url"
                                        value={formData.tracking_url}
                                        onChange={(e) => handleInputChange('tracking_url', e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        rows={4}
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="Add internal notes..."
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>

                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Order Summary</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    {parseFloat(order.discount) > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span>-{formatCurrency(order.discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span>{formatCurrency(order.shipping_fee)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span>{formatCurrency(order.tax)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>{formatCurrency(order.total)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Shipping Address
                                </h2>
                                {order.address ? (
                                    <div className="text-sm space-y-1">
                                        <p className="font-medium">{order.user?.name}</p>
                                        <p>{order.address.address_line1}</p>
                                        {order.address.address_line2 && <p>{order.address.address_line2}</p>}
                                        <p>{order.address.city}, {order.address.state} {order.address.postal_code}</p>
                                        <p>{order.address.country}</p>
                                        {order.address.phone && <p className="mt-2">Phone: {order.address.phone}</p>}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No address provided</p>
                                )}
                            </div>

                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Payment
                                </h2>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Order Status</span>
                                        <OrderStatusBadge status={formData.order_status} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Payment Status</span>
                                        <PaymentStatusBadge status={formData.payment_status} />
                                    </div>
                                </div>
                                {order.payment && order.payment.length > 0 && (
                                    <div className="text-sm space-y-1 mt-3">
                                        {order.payment.map((p) => (
                                            <div key={p.id}>
                                                <p><span className="text-muted-foreground">Method:</span> {p.payment_method}</p>
                                                {p.transaction_id && <p><span className="text-muted-foreground">Tx ID:</span> {p.transaction_id}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

EditOrder.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Orders', href: '/admin/orders' },
        { title: 'Edit Order', href: '' },
    ],
};
