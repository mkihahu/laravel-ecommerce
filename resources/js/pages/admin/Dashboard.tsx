import { Head, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes/admin';
import { storageUrl } from '@/lib/utils';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
    DollarSign,
    ShoppingCart,
    Package,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface Props {
    stats: {
        totalRevenue: number;
        todayOrders: number;
        yesterdayOrders: number;
        totalOrders: number;
        weeklySales: number;
    };
    chartData: {
        labels: string[];
        sales: number[];
    };
    bestSellingProducts: Array<{
        product_id: number;
        total_sold: number;
        product: {
            id: number;
            name: string;
            thumbnail: string;
            price: number;
        };
    }>;
    recentOrders: Array<{
        id: number;
        order_number: string;
        total: number;
        payment_status: string;
        order_status: string;
        created_at: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
        items: Array<{
            product: {
                id: number;
                name: string;
                thumbnail: string;
            };
        }>;
    }>;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Dashboard() {
    const { props } = usePage<Props>();

    const { stats, chartData, bestSellingProducts, recentOrders } = props;

    const orderChange = stats.yesterdayOrders > 0
        ? ((stats.todayOrders - stats.yesterdayOrders) / stats.yesterdayOrders) * 100
        : 0;

    const salesChartData = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Sales',
                data: chartData.sales,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const salesChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: number | string) {
                        return '$' + value;
                    },
                },
            },
        },
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-purple-100 text-purple-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-indigo-100 text-indigo-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Today's Orders</p>
                                <p className="text-2xl font-bold">{stats.todayOrders}</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs">
                            {orderChange >= 0 ? (
                                <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
                            ) : (
                                <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
                            )}
                            <span className={orderChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {Math.abs(orderChange).toFixed(1)}%
                            </span>
                            <span className="ml-1 text-muted-foreground">vs yesterday</span>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Yesterday's Orders</p>
                                <p className="text-2xl font-bold">{stats.yesterdayOrders}</p>
                            </div>
                            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Orders</p>
                                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                                <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Weekly Sales</h3>
                        <div className="h-[300px]">
                            <Line data={salesChartData} options={salesChartOptions} />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Best Selling Products</h3>
                        <div className="space-y-4">
                            {bestSellingProducts.map((item) => (
                                <div key={item.product_id} className="flex items-center gap-4">
                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        {item.product.thumbnail ? (
                                            <img
                                                src={storageUrl(item.product.thumbnail)}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium">{item.product.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatCurrency(item.product.price)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">{item.total_sold}</p>
                                        <p className="text-xs text-muted-foreground">sold</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">Recent Orders</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Order</th>
                                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Products</th>
                                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Total</th>
                                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b last:border-0">
                                        <td className="py-4">
                                            <span className="font-medium">{order.order_number}</span>
                                        </td>
                                        <td className="py-4">
                                            <div>
                                                <p className="text-sm font-medium">{order.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{order.user.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex -space-x-2">
                                                {order.items.slice(0, 3).map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="h-8 w-8 overflow-hidden rounded-full border-2 border-background"
                                                    >
                                                        {item.product.thumbnail ? (
                                                            <img
                                                                src={storageUrl(item.product.thumbnail)}
                                                                alt={item.product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                                                <Package className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-gray-100 text-xs">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="font-medium">{formatCurrency(order.total)}</span>
                                        </td>
                                        <td className="py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.payment_status] || 'bg-gray-100'}`}
                                            >
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-sm text-muted-foreground">
                                                {formatDate(order.created_at)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Admin Dashboard',
            href: dashboard(),
        },
    ],
};