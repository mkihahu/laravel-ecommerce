<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['items' => [], 'count' => 0]);
        }

        $wishlists = Wishlist::with(['product.brand', 'product.category', 'product.images'])
            ->where('user_id', $user->id)
            ->get();

        $items = $wishlists->map(function ($wishlist) {
            $imagePaths = $wishlist->product->images->pluck('image')->toArray();
            return [
                'id' => $wishlist->id,
                'product_id' => $wishlist->product_id,
                'name' => $wishlist->product->name,
                'slug' => $wishlist->product->slug,
                'price' => (float) $wishlist->product->price,
                'salePrice' => $wishlist->product->sale_price ? (float) $wishlist->product->sale_price : null,
                'image' => $imagePaths[0] ?? $wishlist->product->thumbnail,
                'brand' => $wishlist->product->brand?->name,
            ];
        });

        return response()->json([
            'items' => $items,
            'count' => $items->count(),
        ]);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $wishlist = Wishlist::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($wishlist) {
            $wishlist->delete();
            $count = Wishlist::where('user_id', $user->id)->count();
            return response()->json([
                'message' => 'Removed from wishlist',
                'inWishlist' => false,
                'count' => $count,
            ]);
        } else {
            Wishlist::create([
                'user_id' => $user->id,
                'product_id' => $request->product_id,
            ]);
            $count = Wishlist::where('user_id', $user->id)->count();
            return response()->json([
                'message' => 'Added to wishlist',
                'inWishlist' => true,
                'count' => $count,
            ]);
        }
    }

    public function count()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['count' => 0]);
        }

        $count = Wishlist::where('user_id', $user->id)->count();

        return response()->json(['count' => $count]);
    }

    public function check(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['inWishlist' => false]);
        }

        $exists = Wishlist::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->exists();

        return response()->json(['inWishlist' => $exists]);
    }
}
