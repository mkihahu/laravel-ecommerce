<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['items' => [], 'count' => 0]);
        }

        $cart = Cart::with(['items.product.brand', 'items.product.category'])->firstOrCreate(
            ['user_id' => $user->id]
        );

        $items = $cart->items->map(function ($item) {
            $imagePaths = $item->product->images->pluck('image')->toArray();
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'price' => (float) $item->price,
                'quantity' => $item->quantity,
                'image' => $imagePaths[0] ?? $item->product->thumbnail,
                'brand' => $item->product->brand?->name,
                'stock' => $item->product->stock,
            ];
        });

        return response()->json([
            'items' => $items,
            'count' => $cart->items->sum('quantity'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $product = Product::findOrFail($request->product_id);
        $quantity = $request->quantity ?? 1;

        if ($product->stock < $quantity) {
            return response()->json(['message' => 'Insufficient stock'], 400);
        }

        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price' => $product->sale_price ?? $product->price,
            ]);
        }

        $count = $cart->items()->sum('quantity');

        return response()->json([
            'message' => 'Added to cart',
            'count' => $count,
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $cart = Cart::where('user_id', $user->id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $cartItem = CartItem::where('cart_id', $cart->id)->findOrFail($id);
        $cartItem->quantity = $request->quantity;
        $cartItem->save();

        $count = $cart->items()->sum('quantity');

        return response()->json([
            'message' => 'Cart updated',
            'count' => $count,
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $cart = Cart::where('user_id', $user->id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        CartItem::where('cart_id', $cart->id)->findOrFail($id)->delete();

        $count = $cart->items()->sum('quantity');

        return response()->json([
            'message' => 'Item removed',
            'count' => $count,
        ]);
    }

    public function count()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['count' => 0]);
        }

        $cart = Cart::where('user_id', $user->id)->first();
        $count = $cart ? $cart->items()->sum('quantity') : 0;

        return response()->json(['count' => $count]);
    }

    public function page()
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('customer.login');
        }

        $navCategories = Category::whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ]);

        $cart = Cart::with(['items.product.brand', 'items.product.category'])
            ->firstOrCreate(['user_id' => $user->id]);

        $items = $cart->items->map(function ($item) {
            $imagePaths = $item->product->images->pluck('image')->toArray();
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'price' => (float) $item->price,
                'quantity' => $item->quantity,
                'image' => $imagePaths[0] ?? $item->product->thumbnail,
                'brand' => $item->product->brand?->name,
                'stock' => $item->product->stock,
            ];
        });

        return Inertia::render('cart', [
            'items' => $items,
            'count' => $cart->items->sum('quantity'),
            'navCategories' => $navCategories,
        ]);
    }
}
