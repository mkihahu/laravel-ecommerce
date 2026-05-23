import { Head, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import {
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Package,
    Calendar,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { storageUrl } from '@/lib/utils';
import { dashboard } from '@/routes/staff';
import Chart from 'chart.js/auto';

interface OrderItem {
    id: number;
    product: { id: number; name: string; thumbnail: string | null } | null;
    quantity: number;
}

interface Order {
    id: number;
    order_number: string;
    user: { id: number; name: string; email: string } | null;
    items: OrderItem[];
    total: string;
    order_status: string;
    payment_status: string;
    created_at: string;
}

interface BestSellingProduct {
    product_id: number;
    total_sold: number;
    product: { id: number; name: string; thumbnail: string | null; price: string } | null;
}

interface Stats {
    totalRevenue: number;
    todayOrders: number;
    yesterdayOrders: number;
    totalOrders: number;
    weeklySales: number;
}

interface ChartData {
    labels: string[];
    sales: number[];
}

interface Props {
    stats: Stats;
    chartData: ChartData;
    bestSellingProducts: BestSellingProduct[];
    recentOrders: Order[];
}

function formatCurrency(amount: number | string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
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
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}

function PaymentStatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-gray-100 text-gray-800',
    };

    return (
        <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}

function SalesChart({ labels, sales }: ChartData) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(chartRef.current, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Sales',
                        data: sales,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) =>
                                `Sales: ${formatCurrency(context.parsed.y)}`,
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(value as number),
                        },
                    },
                },
            },
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [labels, sales]);

    return <canvas ref={chartRef} />;
}

export default function Dashboard() {
    const { props } = usePage<Props>();
    const { stats, chartData, bestSellingProducts, recentOrders } = props;

    const statCards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: "Today's Orders",
            value: stats.todayOrders.toString(),
            icon: Calendar,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: "Yesterday's Orders",
            value: stats.yesterdayOrders.toString(),
            icon: Calendar,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders.toString(),
            icon: ShoppingCart,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
        {
            title: 'Weekly Sales',
            value: formatCurrency(stats.weeklySales),
            icon: TrendingUp,
            color: 'text-teal-600',
            bgColor: 'bg-teal-100',
        },
    ];

    return (
        <>
            <Head title="Staff Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.title} className="rounded-xl border bg-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                    <div className={`rounded-full p-3 ${stat.bgColor}`}>
                                        <Icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border bg-card p-6 lg:col-span-2">
                        <h2 className="text-lg font-semibold mb-4">Sales Analytics</h2>
                        <div className="h-[300px]">
                            <SalesChart labels={chartData.labels} sales={chartData.sales} />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="text-lg font-semibold mb-4">Best Selling Products</h2>
                        <div className="space-y-4">
                            {bestSellingProducts.map((item, index) => (
                                <div key={item.product_id} className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                                    {item.product?.thumbnail ? (
                                        <img
                                            src={storageUrl(item.product.thumbnail)}
                                            alt={item.product.name}
                                            className="h-10 w-10 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.product?.name || 'Unknown'}</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(item.product?.price || 0)}</p>
                                    </div>
                                    <Badge variant="secondary">{item.total_sold} sold</Badge>
                                </div>
                            ))}
                            {bestSellingProducts.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No sales data yet</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold">Recent Orders</h2>
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
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No orders yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {order.items && order.items.length > 0 && order.items[0].product?.thumbnail ? (
                                                        <img
                                                            src={storageUrl(order.items[0].product.thumbnail)}
                                                            alt={order.items[0].product.name}
                                                            className="h-10 w-10 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                                            <Package className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <span className="truncate max-w-[150px]">
                                                        {order.items && order.items.length > 0
                                                            ? order.items[0].product?.name || 'Unknown'
                                                            : 'No items'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{order.order_number}</TableCell>
                                            <TableCell>{order.user?.name || 'N/A'}</TableCell>
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
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
    ],
};
