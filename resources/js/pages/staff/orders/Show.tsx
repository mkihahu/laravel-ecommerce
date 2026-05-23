import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Printer, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
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
    payment_method: string;
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

export default function ShowOrder() {
    const { props } = usePage<Props>();
    const { order } = props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDelete = () => {
        router.delete(`/staff/orders/${order.id}`, {
            onSuccess: () => {
                setIsDialogOpen(false);
                router.get('/staff/orders');
            },
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const currentStatusIndex = trackingSteps.findIndex((s) => s.status === order.order_status);
    const isCancelled = order.order_status === 'cancelled';

    return (
        <>
            <Head title={`Order ${order.order_number}`} />
            <div className="flex flex-col gap-6 p-4 print:p-0">
                <div className="flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/staff/orders">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Order {order.order_number}</h1>
                            <p className="text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Receipt
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/staff/orders/${order.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setIsDialogOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3 print:grid-cols-2">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl border bg-card p-6 print:border-0 print:p-0 print:mb-6">
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

                        <div className="rounded-xl border bg-card p-6 print:border-0 print:p-0 print:mb-6">
                            <h2 className="text-lg font-semibold mb-4">Order Tracking</h2>
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
                                                        {isCurrent && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {index === 0
                                                                    ? formatDate(order.created_at)
                                                                    : formatDate(order.updated_at)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {order.tracking_number && (
                                <div className="mt-6 p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-medium">Tracking Number</p>
                                    <p className="text-lg font-mono">{order.tracking_number}</p>
                                    {order.tracking_url && (
                                        <a
                                            href={order.tracking_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                                        >
                                            Track shipment →
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {order.notes && (
                            <div className="rounded-xl border bg-card p-6 print:hidden">
                                <h2 className="text-lg font-semibold mb-2">Notes</h2>
                                <p className="text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border bg-card p-6 print:border-0 print:p-0 print:mb-6">
                            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
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
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Order Status</span>
                                    <OrderStatusBadge status={order.order_status} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Payment Status</span>
                                    <PaymentStatusBadge status={order.payment_status} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card p-6 print:border-0 print:p-0 print:mb-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
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

                        <div className="rounded-xl border bg-card p-6 print:border-0 print:p-0 print:mb-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Payment Information
                            </h2>
                            {order.payment && order.payment.length > 0 ? (
                                order.payment.map((p) => (
                                    <div key={p.id} className="text-sm space-y-1">
                                        <p><span className="text-muted-foreground">Method:</span> {p.payment_method}</p>
                                        <p><span className="text-muted-foreground">Amount:</span> {formatCurrency(p.amount)}</p>
                                        <p><span className="text-muted-foreground">Status:</span> <PaymentStatusBadge status={p.status} /></p>
                                        {p.transaction_id && <p><span className="text-muted-foreground">Transaction ID:</span> {p.transaction_id}</p>}
                                        {p.paid_at && <p><span className="text-muted-foreground">Paid at:</span> {formatDate(p.paid_at)}</p>}
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm space-y-1">
                                    <p><span className="text-muted-foreground">Method:</span> <span className="capitalize">{order.payment_method || 'N/A'}</span></p>
                                    <p><span className="text-muted-foreground">Status:</span> <PaymentStatusBadge status={order.payment_status} /></p>
                                    <p className="text-muted-foreground">No payment records yet</p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border bg-card p-6 print:hidden">
                            <h2 className="text-lg font-semibold mb-4">Customer</h2>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">{order.user?.name || 'N/A'}</p>
                                <p className="text-muted-foreground">{order.user?.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete order "{order.order_number}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ShowOrder.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/staff/dashboard' },
        { title: 'Orders', href: '/staff/orders' },
        { title: 'Order Details', href: '' },
    ],
};
