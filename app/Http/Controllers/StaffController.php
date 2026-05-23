<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StaffController extends Controller
{
    public function dashboard()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $weekStart = Carbon::now()->startOfWeek();
        $weekEnd = Carbon::now()->endOfWeek();

        $totalRevenue = Order::where('payment_status', 'paid')
            ->where('order_status', '!=', 'cancelled')
            ->sum('total');

        $todayOrders = Order::whereDate('created_at', $today)->count();
        $yesterdayOrders = Order::whereDate('created_at', $yesterday)->count();
        $totalOrders = Order::count();

        $weeklySales = Order::whereBetween('created_at', [$weekStart, $weekEnd])
            ->where('payment_status', 'paid')
            ->sum('total');

        $dailySales = Order::whereBetween('created_at', [$weekStart, $weekEnd])
            ->where('payment_status', 'paid')
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->groupBy('date')
            ->pluck('total', 'date')
            ->toArray();

        $last7Days = [];
        $last7DaysSales = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $last7Days[] = $date->format('M d');
            $dayKey = $date->format('Y-m-d');
            $last7DaysSales[] = $dailySales[$dayKey] ?? 0;
        }

        $bestSellingProducts = OrderItem::select('product_id')
            ->selectRaw('SUM(quantity) as total_sold')
            ->with('product:id,name,thumbnail,price')
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        $recentOrders = Order::with(['user:id,name,email', 'items.product:id,name,thumbnail'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return inertia('staff/Dashboard', [
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'todayOrders' => $todayOrders,
                'yesterdayOrders' => $yesterdayOrders,
                'totalOrders' => $totalOrders,
                'weeklySales' => $weeklySales,
            ],
            'chartData' => [
                'labels' => $last7Days,
                'sales' => $last7DaysSales,
            ],
            'bestSellingProducts' => $bestSellingProducts,
            'recentOrders' => $recentOrders,
        ]);
    }
}
