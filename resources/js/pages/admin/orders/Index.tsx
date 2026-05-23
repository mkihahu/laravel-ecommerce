import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Search, Download, Eye, Edit, Trash2, X, FileText, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { storageUrl } from '@/lib/utils';

interface OrderItem {
    id: number;
    product: { id: number; name: string; thumbnail: string | null } | null;
    quantity: number;
}

interface Payment {
    id: number;
    payment_method: string;
    status: string;
}

interface Order {
    id: number;
    order_number: string;
    user: { id: number; name: string; email: string } | null;
    items: OrderItem[];
    payment: Payment[];
    subtotal: string;
    discount: string;
    shipping_fee: string;
    tax: string;
    total: string;
    order_status: string;
    payment_status: string;
    payment_method: string;
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

interface Filters {
    search?: string;
    order_status?: string;
    payment_status?: string;
}

interface Props {
    orders: PaginatedOrders;
    filters: Filters;
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

export default function OrdersIndex() {
    const { props } = usePage<Props>();
    const { orders, filters } = props;

    const [search, setSearch] = useState(filters.search || '');
    const [orderStatus, setOrderStatus] = useState(filters.order_status || '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || '');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (orderStatus) params.set('order_status', orderStatus);
        if (paymentStatus) params.set('payment_status', paymentStatus);

        router.get(`/admin/orders?${params.toString()}`, {}, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setOrderStatus('');
        setPaymentStatus('');
        router.get('/admin/orders', {}, { preserveState: true });
    };

    const handleExport = () => {
        setIsExporting(true);
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (orderStatus) params.set('order_status', orderStatus);
        if (paymentStatus) params.set('payment_status', paymentStatus);

        window.location.href = `/admin/orders/export?${params.toString()}`;
        setTimeout(() => setIsExporting(false), 2000);
    };

    const handleDelete = () => {
        if (orderToDelete) {
            router.delete(`/admin/orders/${orderToDelete.id}`, {
                onSuccess: () => setIsDialogOpen(false),
            });
        }
    };

    const openDeleteDialog = (order: Order) => {
        setOrderToDelete(order);
        setIsDialogOpen(true);
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (search !== (filters.search || '')) {
                handleFilter();
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    return (
        <>
            <Head title="Orders" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Orders</h1>
                        <p className="text-muted-foreground">Manage customer orders</p>
                    </div>
                    <Button onClick={handleExport} disabled={isExporting}>
                        <Download className="mr-2 h-4 w-4" />
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </Button>
                </div>

                <div className="rounded-xl border bg-card">
                    <div className="p-4 border-b">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by order number or customer..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={orderStatus} onValueChange={(v) => { setOrderStatus(v); setTimeout(handleFilter, 100); }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Order Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={paymentStatus} onValueChange={(v) => { setPaymentStatus(v); setTimeout(handleFilter, 100); }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Payment Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payments</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                            {(search || orderStatus || paymentStatus) && (
                                <Button variant="ghost" onClick={handleReset}>
                                    <X className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Order Number</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Order Status</TableHead>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                            <FileText className="mx-auto h-8 w-8 mb-2" />
                                            No orders found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.data.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {order.items && order.items.length > 0 && order.items[0].product?.thumbnail ? (
                                                        <img
                                                            src={storageUrl(order.items[0].product.thumbnail)}
                                                            alt={order.items[0].product.name}
                                                            className="h-10 w-10 rounded-lg object-cover border"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                            <Package className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate max-w-[200px]">
                                                            {order.items && order.items.length > 0
                                                                ? order.items[0].product?.name || 'Unknown'
                                                                : 'No items'}
                                                        </p>
                                                        {order.items && order.items.length > 1 && (
                                                            <p className="text-xs text-muted-foreground">
                                                                +{order.items.length - 1} more item{order.items.length > 2 ? 's' : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{order.order_number}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{order.user?.name || 'N/A'}</p>
                                                    <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                                            <TableCell><OrderStatusBadge status={order.order_status} /></TableCell>
                                            <TableCell><span className="capitalize">{order.payment_method || '-'}</span></TableCell>
                                            <TableCell><PaymentStatusBadge status={order.payment_status} /></TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/admin/orders/${order.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/admin/orders/${order.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(order)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete order "{orderToDelete?.order_number}"? This action cannot be undone.
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

OrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Orders', href: '/admin/orders' },
    ],
};
