<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollectionController extends Controller
{
    public function index(string $slug)
    {
        $category = Category::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $childCategoryIds = Category::where('parent_id', $category->id)->pluck('id')->toArray();
        $categoryIds = array_merge([$category->id], $childCategoryIds);

        $brands = Brand::where('status', 'active')
            ->withCount(['products' => function ($query) use ($categoryIds) {
                $query->whereIn('category_id', $categoryIds)->where('status', 'active');
            }])
            ->having('products_count', '>', 0)
            ->orderBy('name')
            ->get()
            ->map(fn ($brand) => [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'count' => $brand->products_count,
            ]);

        $subCategories = Category::where('parent_id', $category->id)
            ->where('status', 'active')
            ->withCount('products')
            ->orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'count' => $cat->products_count,
            ]);

        $allCategories = Category::where('status', 'active')
            ->whereNull('parent_id')
            ->where('id', '!=', $category->id)
            ->orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ]);

        $navCategories = Category::where('status', 'active')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ]);

        $productsQuery = Product::whereIn('category_id', $categoryIds)
            ->where('status', 'active')
            ->with(['category', 'brand', 'images', 'reviews' => function ($query) {
                $query->where('status', 'approved');
            }]);

        // Apply search filter
        if (request('search')) {
            $searchTerm = request('search');
            $productsQuery->where(function ($query) use ($searchTerm) {
                $query->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhereHas('brand', function ($brandQuery) use ($searchTerm) {
                        $brandQuery->where('name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Apply brand filter by slug
        if (request('brands')) {
            $brandSlugs = explode(',', request('brands'));
            $productsQuery->whereHas('brand', function ($query) use ($brandSlugs) {
                $query->whereIn('slug', $brandSlugs);
            });
        }

        // Apply price range filter
        if (request('min_price')) {
            $productsQuery->where('price', '>=', request('min_price'));
        }
        if (request('max_price')) {
            $productsQuery->where('price', '<=', request('max_price'));
        }

        // Apply rating filter
        if (request('ratings')) {
            $minRating = min(explode(',', request('ratings')));
            $productsQuery->whereHas('reviews', function ($query) use ($minRating) {
                $query->selectRaw('product_id')
                    ->where('status', 'approved')
                    ->groupBy('product_id')
                    ->havingRaw('avg(rating) >= ?', [$minRating]);
            }, '>=', 1);
        }

        // Apply sorting
        $sort = request('sort', 'newest');
        if ($sort === 'price-low') {
            $productsQuery->orderBy('price', 'asc');
        } elseif ($sort === 'price-high') {
            $productsQuery->orderBy('price', 'desc');
        } elseif ($sort === 'rating') {
            $productsQuery->withCount(['reviews as avg_rating' => function ($query) {
                $query->select(DB::raw('coalesce(avg(rating),0)'));
            }])->orderByDesc('avg_rating');
        } elseif ($sort === 'popular') {
            $productsQuery->orderByDesc('views');
        } else {
            $productsQuery->orderByDesc('created_at'); // newest
        }

        $products = $productsQuery->paginate(12)->withQueryString();

        $products->getCollection()->transform(function ($product) {
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
                'hoverImage' => $imagePaths[1] ?? $imagePaths[0] ?? $product->thumbnail,
                'discount' => $discount,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ] : null,
                'brand' => $product->brand ? [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                    'slug' => $product->brand->slug,
                ] : null,
                'stock' => $product->stock,
            ];
        });

        return inertia('collections/Show', [
            'canRegister' => true,
            'navCategories' => $navCategories,
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category->image,
            ],
            'products' => $products,
            'brands' => $brands,
            'subCategories' => $subCategories,
            'allCategories' => $allCategories,
        ]);
    }

    public function allProducts()
    {
        $brands = Brand::where('status', 'active')
            ->withCount('products')
            ->having('products_count', '>', 0)
            ->orderBy('name')
            ->get()
            ->map(fn ($brand) => [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'count' => $brand->products_count,
            ]);

        $allCategories = Category::where('status', 'active')
            ->whereNull('parent_id')
            ->withCount('products')
            ->orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'count' => $cat->products_count,
            ]);

        $navCategories = Category::where('status', 'active')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ]);

        $productsQuery = Product::where('status', 'active')
            ->with(['category', 'brand', 'images', 'reviews' => function ($query) {
                $query->where('status', 'approved');
            }]);

        // Apply search filter
        if (request('search')) {
            $searchTerm = request('search');
            $productsQuery->where(function ($query) use ($searchTerm) {
                $query->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhereHas('brand', function ($brandQuery) use ($searchTerm) {
                        $brandQuery->where('name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Apply brand filter by slug
        if (request('brands')) {
            $brandSlugs = explode(',', request('brands'));
            $productsQuery->whereHas('brand', function ($query) use ($brandSlugs) {
                $query->whereIn('slug', $brandSlugs);
            });
        }

        // Apply category filter by slug
        if (request('categories')) {
            $categorySlugs = explode(',', request('categories'));
            $categoryIds = Category::whereIn('slug', $categorySlugs)->pluck('id')->toArray();
            $childCategoryIds = Category::whereIn('parent_id', $categoryIds)->pluck('id')->toArray();
            $allCategoryIds = array_merge($categoryIds, $childCategoryIds);
            $productsQuery->whereIn('category_id', $allCategoryIds);
        }

        // Apply price range filter
        if (request('min_price')) {
            $productsQuery->where('price', '>=', request('min_price'));
        }
        if (request('max_price')) {
            $productsQuery->where('price', '<=', request('max_price'));
        }

        // Apply rating filter
        if (request('ratings')) {
            $minRating = min(explode(',', request('ratings')));
            $productsQuery->whereHas('reviews', function ($query) use ($minRating) {
                $query->selectRaw('product_id')
                    ->where('status', 'approved')
                    ->groupBy('product_id')
                    ->havingRaw('avg(rating) >= ?', [$minRating]);
            }, '>=', 1);
        }

        // Apply sorting
        $sort = request('sort', 'newest');
        if ($sort === 'price-low') {
            $productsQuery->orderBy('price', 'asc');
        } elseif ($sort === 'price-high') {
            $productsQuery->orderBy('price', 'desc');
        } elseif ($sort === 'rating') {
            $productsQuery->withCount(['reviews as avg_rating' => function ($query) {
                $query->select(DB::raw('coalesce(avg(rating),0)'));
            }])->orderByDesc('avg_rating');
        } elseif ($sort === 'popular') {
            $productsQuery->orderByDesc('views');
        } else {
            $productsQuery->orderByDesc('created_at'); // newest
        }

        $products = $productsQuery->paginate(12)->withQueryString();

        $products->getCollection()->transform(function ($product) {
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
                'hoverImage' => $imagePaths[1] ?? $imagePaths[0] ?? $product->thumbnail,
                'discount' => $discount,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ] : null,
                'brand' => $product->brand ? [
                    'id' => $product->brand->id,
                    'name' => $product->brand->name,
                    'slug' => $product->brand->slug,
                ] : null,
                'stock' => $product->stock,
            ];
        });

        return inertia('collections/Show', [
            'canRegister' => true,
            'navCategories' => $navCategories,
            'category' => [
                'id' => null,
                'name' => 'All Products',
                'slug' => 'all-product',
                'description' => 'Browse our complete collection of premium products',
                'image' => null,
            ],
            'products' => $products,
            'brands' => $brands,
            'subCategories' => [],
            'allCategories' => $allCategories,
        ]);
    }
}
