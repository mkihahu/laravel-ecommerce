import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Package, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    product: { id: number; name: string; thumbnail: string | null } | null;
    quantity: number;
}

interface Order {
    id: number;
    order_number: string;
    items: OrderItem[];
    subtotal: string;
    discount: string;
    shipping_fee: string;
    tax: string;
    total: string;
    order_status: string;
    payment_status: string;
    created_at: string;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    created_at: string;
}

interface Props {
    customer: Customer;
    orders: PaginatedOrders;
}

function formatCurrency(amount: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(parseFloat(amount));
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
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

export default function ShowCustomer() {
    const { props } = usePage<Props>();
    const { customer, orders } = props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDelete = () => {
        router.delete(`/admin/customers/${customer.id}`, {
            onSuccess: () => {
                setIsDialogOpen(false);
                router.get('/admin/customers');
            },
        });
    };

    return (
        <>
            <Head title={`Customer ${customer.name}`} />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/customers">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{customer.name}</h1>
                            <p className="text-muted-foreground">Customer since {formatDate(customer.created_at)}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/admin/customers/${customer.id}/edit`}>
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

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl border bg-card">
                            <div className="p-6 border-b">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    Order History
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order Number</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Order Status</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    <Package className="mx-auto h-8 w-8 mb-2" />
                                                    No orders found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            orders.data.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-medium">
                                                        <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">
                                                            {order.order_number}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {order.items && order.items.length > 0 && order.items[0].product?.thumbnail ? (
                                                                <img
                                                                    src={storageUrl(order.items[0].product.thumbnail)}
                                                                    alt={order.items[0].product.name}
                                                                    className="h-8 w-8 rounded object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <span className="truncate max-w-[150px]">
                                                                {order.items && order.items.length > 0
                                                                    ? order.items[0].product?.name || 'Unknown'
                                                                    : 'No items'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                                                    <TableCell><OrderStatusBadge status={order.order_status} /></TableCell>
                                                    <TableCell><PaymentStatusBadge status={order.payment_status} /></TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {orders.last_page > 1 && (
                                <div className="flex items-center justify-between p-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {orders.from} to {orders.to} of {orders.total} results
                                    </p>
                                    <div className="flex gap-1">
                                        {orders.links.map((link, index) => (
                                            <Button
                                                key={index}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => {
                                                    if (link.url) {
                                                        router.get(link.url, {}, { preserveState: true });
                                                    }
                                                }}
                                            >
                                                {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border bg-card p-6">
                            <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{customer.email}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{customer.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Registered</p>
                                        <p className="font-medium">{formatDate(customer.created_at)}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-card p-6">
                            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Orders</span>
                                    <span className="font-semibold">{orders.total}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Customer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{customer.name}"? This will also delete all their orders. This action cannot be undone.
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

ShowCustomer.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Customers', href: '/admin/customers' },
        { title: 'Customer Details', href: '' },
    ],
};
