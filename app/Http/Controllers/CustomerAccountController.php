<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Category;
use App\Models\Wishlist;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomerAccountController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $navCategories = Category::where('status', 'active')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ]);

        $orders = $user->orders()
            ->with(['items.product.images', 'address'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total' => (float) $order->total,
                'status' => $order->order_status,
                'payment_status' => $order->payment_status,
                'items_count' => $order->items->count(),
                'placed_at' => $order->created_at->toDateString(),
                'items' => $order->items->map(fn ($item) => [
                    'product_id' => $item->product_id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'price' => (float) $item->price,
                    'quantity' => $item->quantity,
                    'total' => (float) $item->total,
                    'image' => $item->product->images->first()->image ?? $item->product->thumbnail,
                ]),
            ]);

        $wishlistItems = Wishlist::where('user_id', $user->id)
            ->with('product.category')
            ->latest()
            ->get()
            ->map(fn ($wishlist) => [
                'id' => $wishlist->id,
                'product_id' => $wishlist->product_id,
                'name' => $wishlist->product->name,
                'slug' => $wishlist->product->slug,
                'price' => (float) ($wishlist->product->sale_price ?? $wishlist->product->price),
                'sale_price' => $wishlist->product->sale_price ? (float) $wishlist->product->sale_price : null,
                'image' => $wishlist->product->images->first()->image ?? $wishlist->product->thumbnail,
                'category' => $wishlist->product->category->name ?? null,
            ]);

        $cart = Cart::where('user_id', $user->id)
            ->with(['items.product.images', 'items.product.brand'])
            ->first();

        $cartItems = $cart ? $cart->items->map(fn ($item) => [
            'id' => $item->id,
            'product_id' => $item->product_id,
            'name' => $item->product->name,
            'slug' => $item->product->slug,
            'price' => (float) $item->price,
            'quantity' => $item->quantity,
            'image' => $item->product->images->first()->image ?? $item->product->thumbnail,
            'stock' => $item->product->stock,
        ]) : [];

        $notifications = $user->notifications()
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'is_read' => $notification->is_read,
                'created_at' => $notification->created_at->format('d M Y h:i:A'),
            ]);

        $billingAddress = $user->addresses()
            ->where('type', 'billing')
            ->first();
        $shippingAddress = $user->addresses()
            ->where('type', 'shipping')
            ->first();

        return inertia('customer/my-account', [
            'navCategories' => $navCategories,
            'notifications' => $notifications,
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'member_since' => $user->created_at->format('F Y'),
            ],
            'orders' => $orders,
            'wishlistItems' => $wishlistItems,
            'cartItems' => $cartItems,
            'billingAddress' => $billingAddress ? [
                'full_name' => $billingAddress->full_name,
                'email' => $billingAddress->email,
                'phone' => $billingAddress->phone,
                'address_line_1' => $billingAddress->address_line_1,
                'address_line_2' => $billingAddress->address_line_2,
                'city' => $billingAddress->city,
                'state' => $billingAddress->state,
                'zip_code' => $billingAddress->zip_code,
                'country' => $billingAddress->country,
            ] : null,
            'shippingAddress' => $shippingAddress ? [
                'full_name' => $shippingAddress->full_name,
                'email' => $shippingAddress->email,
                'phone' => $shippingAddress->phone,
                'address_line_1' => $shippingAddress->address_line_1,
                'address_line_2' => $shippingAddress->address_line_2,
                'city' => $shippingAddress->city,
                'state' => $shippingAddress->state,
                'zip_code' => $shippingAddress->zip_code,
                'country' => $shippingAddress->country,
            ] : null,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        return redirect()->route('customer.my-account')
            ->with('success', 'Profile updated successfully.');
    }

    public function updateAddress(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'type' => 'required|in:billing,shipping',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'zip' => 'required|string|max:20',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
        ]);

        Address::updateOrCreate(
            ['user_id' => $user->id, 'type' => $validated['type']],
            [
                'full_name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address_line_1' => $validated['address'],
                'city' => $validated['city'],
                'zip_code' => $validated['zip'],
                'country' => 'US',
            ]
        );

        return redirect()->route('customer.my-account')
            ->with('success', ucfirst($validated['type']) . ' address saved successfully.');
    }
}
