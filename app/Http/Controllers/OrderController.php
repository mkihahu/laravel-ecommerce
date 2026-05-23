<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'address', 'items.product', 'payment'])
            ->when($request->search, function ($q, $search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($request->order_status, function ($q, $status) {
                $q->where('order_status', $status);
            })
            ->when($request->payment_status, function ($q, $status) {
                $q->where('payment_status', $status);
            })
            ->latest();

        $orders = $query->paginate(15)->withQueryString();

        return inertia('admin/orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'order_status', 'payment_status']),
        ]);
    }

    public function export(Request $request)
    {
        $query = Order::with(['user', 'address', 'items.product'])
            ->when($request->search, function ($q, $search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%");
                    });
            })
            ->when($request->order_status, function ($q, $status) {
                $q->where('order_status', $status);
            })
            ->when($request->payment_status, function ($q, $status) {
                $q->where('payment_status', $status);
            })
            ->latest();

        $orders = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="orders_' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'Order Number',
                'Customer Name',
                'Email',
                'Status',
                'Payment Method',
                'Payment Status',
                'Subtotal',
                'Discount',
                'Shipping',
                'Tax',
                'Total',
                'Items',
                'Date',
            ]);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number,
                    $order->user->name ?? 'N/A',
                    $order->user->email ?? 'N/A',
                    $order->order_status,
                    $order->payment_method,
                    $order->payment_status,
                    $order->subtotal,
                    $order->discount,
                    $order->shipping_fee,
                    $order->tax,
                    $order->total,
                    $order->items->count(),
                    $order->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function show(Order $order)
    {
        $order->load(['user', 'address', 'items.product', 'payment']);

        return inertia('admin/orders/Show', [
            'order' => $order,
        ]);
    }

    public function edit(Order $order)
    {
        $order->load(['user', 'address', 'items.product', 'payment']);

        return inertia('admin/orders/Edit', [
            'order' => $order,
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'order_status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            'payment_status' => 'required|in:pending,paid,failed,refunded',
            'notes' => 'nullable|string',
            'tracking_number' => 'nullable|string|max:255',
            'tracking_url' => 'nullable|url|max:500',
        ]);

        $order->update($validated);

        \App\Models\Notification::create([
            'user_id' => $order->user_id,
            'title' => 'Order Update',
            'message' => 'Your order #' . $order->order_number . ' has been updated and current order status is ' . $validated['order_status'] . '. Thank you for your patience!',
            'is_read' => false,
        ]);

        return redirect()->route('admin.orders.show', $order)
            ->with('success', 'Order updated successfully.');
    }

    public function destroy(Order $order)
    {
        $order->payment()->delete();
        $order->items()->delete();
        $order->delete();

        return redirect()->route('admin.orders.index')
            ->with('success', 'Order deleted successfully.');
    }
}
