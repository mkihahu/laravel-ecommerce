<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Color;
use App\Models\Capacity;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\ProductSpecification;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $status = $request->get('status', '');
        $category = $request->get('category', '');
        $brand = $request->get('brand', '');

        $products = Product::with(['category', 'brand', 'images'])
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            })
            ->when($status, function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->when($category, function ($query) use ($category) {
                $query->where('category_id', $category);
            })
            ->when($brand, function ($query) use ($brand) {
                $query->where('brand_id', $brand);
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        $categories = Category::where('status', 'active')->get();
        $brands = Brand::where('status', 'active')->get();

        return inertia('admin/products/Index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'category' => $category,
                'brand' => $brand,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $format = $request->get('format', 'csv');
        
        $products = Product::with(['category', 'brand'])->get();

        $data = $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category?->name,
                'brand' => $product->brand?->name,
                'price' => $product->price,
                'sale_price' => $product->sale_price,
                'stock' => $product->stock,
                'status' => $product->status,
                'featured' => $product->featured ? 'Yes' : 'No',
                'views' => $product->views,
            ];
        });

        if ($format === 'json') {
            return response()->json($data)->header('Content-Disposition', 'attachment; filename=products.json');
        }

        $headers = ['ID', 'Name', 'SKU', 'Category', 'Brand', 'Price', 'Sale Price', 'Stock', 'Status', 'Featured', 'Views'];
        
        $csv = implode(',', $headers) . "\n";
        foreach ($data as $row) {
            $csv .= implode(',', array_values($row)) . "\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename=products.csv');
    }

    public function create()
    {
        $categories = Category::where('status', 'active')->get();
        $brands = Brand::where('status', 'active')->get();
        $colors = Color::where('status', 'active')->get();
        $capacities = Capacity::where('status', 'active')->get();

        return inertia('admin/products/Create', [
            'categories' => $categories,
            'brands' => $brands,
            'colors' => $colors,
            'capacities' => $capacities,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'sku' => 'required|string|unique:products,sku|max:100',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'warranty' => 'nullable|string|max:100',
            'featured' => 'boolean',
            'status' => 'required|in:active,inactive',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'specifications' => 'nullable|array',
            'specifications.*.spec_key' => 'required|string',
            'specifications.*.spec_value' => 'required|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
        }

        $product = Product::create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => $path,
                ]);
            }
        }

        if ($request->specifications) {
            foreach ($request->specifications as $spec) {
                ProductSpecification::create([
                    'product_id' => $product->id,
                    'spec_key' => $spec['spec_key'],
                    'spec_value' => $spec['spec_value'],
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Product created successfully');
    }

    public function show(Product $product)
    {
        $product->load(['category', 'brand', 'images', 'variants', 'specifications']);

        return inertia('admin/products/Show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product)
    {
        $product->load(['images', 'specifications', 'variants']);
        $categories = Category::where('status', 'active')->get();
        $brands = Brand::where('status', 'active')->get();

        return inertia('admin/products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'sku' => 'required|string|unique:products,sku,' . $product->id . '|max:100',
            'short_description' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'warranty' => 'nullable|string|max:100',
            'featured' => 'boolean',
            'status' => 'required|in:active,inactive',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'specifications' => 'nullable|array',
            'specifications.*.spec_key' => 'required|string',
            'specifications.*.spec_value' => 'required|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('thumbnail')) {
            if ($product->thumbnail) {
                Storage::disk('public')->delete($product->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
        }

        $product->update($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => $path,
                ]);
            }
        }

        if ($request->specifications) {
            $product->specifications()->delete();
            foreach ($request->specifications as $spec) {
                ProductSpecification::create([
                    'product_id' => $product->id,
                    'spec_key' => $spec['spec_key'],
                    'spec_value' => $spec['spec_value'],
                ]);
            }
        }

        return redirect()->route('admin.products.show', $product->id)->with('success', 'Product updated successfully');
    }

    public function destroy(Product $product)
    {
        if ($product->thumbnail) {
            Storage::disk('public')->delete($product->thumbnail);
        }

        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image);
        }

        $product->images()->delete();
        $product->specifications()->delete();
        $product->variants()->delete();

        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Product deleted successfully');
    }

    public function destroyImage(ProductImage $image)
    {
        Storage::disk('public')->delete($image->image);
        $image->delete();

        return response()->json(['success' => true]);
    }

    public function shopShow(string $slug)
    {
        $product = Product::where('slug', $slug)
            ->where('status', 'active')
            ->with(['category', 'brand', 'images', 'specifications', 'reviews' => function ($query) {
                $query->where('status', 'approved')->with('user:id,name');
            }])
            ->firstOrFail();

        $product->increment('views');

        $avgRating = $product->reviews->avg('rating') ?? 0;
        $reviewCount = $product->reviews->count();
        $imagePaths = $product->images->pluck('image')->toArray();
        $discount = null;
        if ($product->sale_price) {
            $discount = round((($product->price - $product->sale_price) / $product->price) * 100);
        }

        $relatedProducts = Product::where('status', 'active')
            ->where('id', '!=', $product->id)
            ->where(function ($query) use ($product) {
                $query->where('category_id', $product->category_id)
                    ->orWhereHas('brand', function ($q) use ($product) {
                        $q->where('id', $product->brand_id);
                    });
            })
            ->with(['images', 'reviews' => function ($query) {
                $query->where('status', 'approved');
            }])
            ->limit(4)
            ->get()
            ->map(function ($relatedProduct) {
                $relatedAvgRating = $relatedProduct->reviews->avg('rating') ?? 0;
                $relatedReviewCount = $relatedProduct->reviews->count();
                $relatedImagePaths = $relatedProduct->images->pluck('image')->toArray();
                $relatedDiscount = null;
                if ($relatedProduct->sale_price) {
                    $relatedDiscount = round((($relatedProduct->price - $relatedProduct->sale_price) / $relatedProduct->price) * 100);
                }

                return [
                    'id' => $relatedProduct->id,
                    'name' => $relatedProduct->name,
                    'slug' => $relatedProduct->slug,
                    'price' => (float) $relatedProduct->price,
                    'salePrice' => $relatedProduct->sale_price ? (float) $relatedProduct->sale_price : null,
                    'rating' => round($relatedAvgRating, 1),
                    'reviews' => $relatedReviewCount,
                    'image' => $relatedImagePaths[0] ?? $relatedProduct->thumbnail,
                    'hoverImage' => $relatedImagePaths[1] ?? $relatedImagePaths[0] ?? $relatedProduct->thumbnail,
                    'discount' => $relatedDiscount,
                    'category' => $relatedProduct->category ? [
                        'id' => $relatedProduct->category->id,
                        'name' => $relatedProduct->category->name,
                        'slug' => $relatedProduct->category->slug,
                    ] : null,
                    'brand' => $relatedProduct->brand ? [
                        'id' => $relatedProduct->brand->id,
                        'name' => $relatedProduct->brand->name,
                        'slug' => $relatedProduct->brand->slug,
                    ] : null,
                    'stock' => $relatedProduct->stock,
                ];
            });

        $navCategories = Category::where('status', 'active')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ]);

        $reviews = $product->reviews->map(fn ($review) => [
            'id' => $review->id,
            'user_name' => $review->user->name ?? 'Anonymous',
            'rating' => $review->rating,
            'comment' => $review->comment,
            'created_at' => $review->created_at->format('M d, Y'),
        ]);

        $specifications = $product->specifications->map(fn ($spec) => [
            'key' => $spec->spec_key,
            'value' => $spec->spec_value,
        ]);

        $canReview = false;
        $reviewDebug = ['authenticated' => false];
        if (Auth::check()) {
            $user = Auth::user();
            $reviewDebug['authenticated'] = true;
            $reviewDebug['user_id'] = $user->id;
            $reviewDebug['product_id'] = $product->id;

            $orderItemCount = OrderItem::where('product_id', $product->id)->count();
            $reviewDebug['order_items_for_product'] = $orderItemCount;

            $userDeliveredCount = Order::where('user_id', $user->id)
                ->where('order_status', 'delivered')
                ->where('payment_status', 'paid')
                ->count();
            $reviewDebug['user_delivered_paid_orders'] = $userDeliveredCount;

            $hasDeliveredOrder = OrderItem::where('product_id', $product->id)
                ->whereHas('order', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->where('order_status', 'delivered')
                      ->where('payment_status', 'paid');
                })->exists();
            $reviewDebug['has_delivered_order'] = $hasDeliveredOrder;

            $alreadyReviewed = Review::where('user_id', $user->id)
                ->where('product_id', $product->id)
                ->exists();
            $reviewDebug['already_reviewed'] = $alreadyReviewed;

            $canReview = $hasDeliveredOrder && !$alreadyReviewed;
        }
        $reviewDebug['can_review'] = $canReview;

        return inertia('shop/Show', [
            'canRegister' => true,
            'canReview' => $canReview,
            'reviewDebug' => $reviewDebug,
            'navCategories' => $navCategories,
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'price' => (float) $product->price,
                'salePrice' => $product->sale_price ? (float) $product->sale_price : null,
                'discount' => $discount,
                'rating' => round($avgRating, 1),
                'reviewCount' => $reviewCount,
                'stock' => $product->stock,
                'weight' => $product->weight,
                'warranty' => $product->warranty,
                'images' => $imagePaths,
                'thumbnail' => $product->thumbnail,
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
                'specifications' => $specifications,
                'reviews' => $reviews,
            ],
            'relatedProducts' => $relatedProducts,
        ]);
    }

    public function submitReview(Request $request, string $slug)
    {
        $product = Product::where('slug', $slug)->where('status', 'active')->firstOrFail();
        $user = Auth::user();

        $hasDeliveredOrder = OrderItem::where('product_id', $product->id)
            ->whereHas('order', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->where('order_status', 'delivered')
                  ->where('payment_status', 'paid');
            })->exists();

        if (!$hasDeliveredOrder) {
            return redirect()->back()->with('error', 'You can only review products you have purchased and received.');
        }

        $alreadyReviewed = Review::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists();

        if ($alreadyReviewed) {
            return redirect()->back()->with('error', 'You have already reviewed this product.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        Review::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Review submitted successfully! It will appear after approval.');
    }
}