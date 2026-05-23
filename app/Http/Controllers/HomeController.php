<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function index()
    {
        $navCategories = Category::where('status', 'active')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ];
            });

        $categories = Category::where('status', 'active')
            ->whereNull('parent_id')
            ->withCount('products')
            ->limit(8)
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'count' => $category->products_count,
                    'image' => $category->image,
                ];
            });

        $newArrivals = Product::where('status', 'active')
            ->with(['images', 'reviews' => function ($query) {
                $query->where('status', 'approved');
            }])
            ->orderByDesc('created_at')
            ->limit(4)
            ->get()
            ->map(function ($product) {
                $avgRating = $product->reviews->avg('rating') ?? 0;
                $reviewCount = $product->reviews->count();
                $imagePaths = $product->images->pluck('image')->toArray();

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'salePrice' => $product->sale_price ? (float) $product->sale_price : null,
                    'rating' => round($avgRating, 1),
                    'reviews' => $reviewCount,
                    'image' => $imagePaths[0] ?? $product->thumbnail,
                    'hoverImage' => $imagePaths[1] ?? $imagePaths[0] ?? $product->thumbnail,
                    'badge' => $product->sale_price ? 'Sale' : 'New',
                ];
            });

        $bestSellers = Product::where('status', 'active')
            ->with(['images', 'reviews' => function ($query) {
                $query->where('status', 'approved');
            }])
            ->orderByDesc('views')
            ->limit(6)
            ->get()
            ->map(function ($product) {
                $avgRating = $product->reviews->avg('rating') ?? 0;
                $reviewCount = $product->reviews->count();
                $imagePaths = $product->images->pluck('image')->toArray();
                $discount = null;
                if ($product->sale_price) {
                    $discount = round((($product->price - $product->sale_price) / $product->price) * 100);
                }

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'salePrice' => $product->sale_price ? (float) $product->sale_price : null,
                    'rating' => round($avgRating, 1),
                    'reviews' => $reviewCount,
                    'image' => $imagePaths[0] ?? $product->thumbnail,
                    'discount' => $discount,
                ];
            });

        $testimonials = Review::where('status', 'approved')
            ->with('user:id,name,role')
            ->orderByDesc('rating')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'name' => $review->user->name ?? 'Anonymous',
                    'role' => $review->user->role ?? 'Customer',
                    'avatar' => null,
                    'rating' => $review->rating,
                    'text' => $review->comment ?? '',
                ];
            });

        return inertia('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'navCategories' => $navCategories,
            'categories' => $categories,
            'newArrivals' => $newArrivals,
            'bestSellers' => $bestSellers,
            'testimonials' => $testimonials,
        ]);
    }
}
