<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Admin\PaymentSettingController as AdminPaymentSettingController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\StaffOrdersController;
use App\Http\Controllers\StaffCouponController;

use App\Http\Controllers\HomeController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\CustomerAuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\CustomerAccountController;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::get('/collections/all-product', [CollectionController::class, 'allProducts'])->name('collections.all');
Route::get('/collections/{slug}', [CollectionController::class, 'index'])->name('collections.show');
Route::get('/shop/{slug}', [ProductController::class, 'shopShow'])->name('shop.show');

Route::get('/customer/login', [CustomerAuthController::class, 'login'])->name('customer.login');
Route::get('/customer/register', [CustomerAuthController::class, 'register'])->name('customer.register');

Route::middleware(['auth'])->group(function () {
    Route::get('/cart', [CartController::class, 'page'])->name('cart.page');
    Route::get('/cart/data', [CartController::class, 'index'])->name('cart.data');
    Route::get('/cart/count', [CartController::class, 'count'])->name('cart.count');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::put('/cart/{id}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{id}', [CartController::class, 'destroy'])->name('cart.destroy');

    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/checkout/success/{order}', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::post('/checkout/coupon', [CheckoutController::class, 'applyCoupon'])->name('checkout.coupon');
    Route::post('/checkout/payment-intent', [CheckoutController::class, 'createPaymentIntent'])->name('checkout.payment-intent');
    Route::post('/checkout/paypal/create', [CheckoutController::class, 'createPayPalOrder'])->name('checkout.paypal.create');
    Route::post('/checkout/paypal/capture', [CheckoutController::class, 'capturePayPalOrder'])->name('checkout.paypal.capture');

    Route::post('/shop/{slug}/review', [ProductController::class, 'submitReview'])->name('shop.review');

    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::get('/wishlist/count', [WishlistController::class, 'count'])->name('wishlist.count');
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::post('/wishlist/check', [WishlistController::class, 'check'])->name('wishlist.check');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();
        return match ($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'staff' => redirect()->route('staff.dashboard'),
            'customer' => redirect('/customer/my-account'),
            default => redirect('/customer/my-account'),
        };
    })->name('dashboard');

    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
        
        Route::get('/admin/products', [ProductController::class, 'index'])->name('admin.products.index');
        Route::get('/admin/products/export', [ProductController::class, 'export'])->name('admin.products.export');
        Route::get('/admin/products/create', [ProductController::class, 'create'])->name('admin.products.create');
        Route::post('/admin/products', [ProductController::class, 'store'])->name('admin.products.store');
        Route::get('/admin/products/{product}', [ProductController::class, 'show'])->name('admin.products.show');
        Route::get('/admin/products/{product}/edit', [ProductController::class, 'edit'])->name('admin.products.edit');
        Route::put('/admin/products/{product}', [ProductController::class, 'update'])->name('admin.products.update');
        Route::delete('/admin/products/{product}', [ProductController::class, 'destroy'])->name('admin.products.destroy');
        Route::delete('/admin/products/images/{image}', [ProductController::class, 'destroyImage'])->name('admin.products.destroyImage');

        Route::get('/admin/orders', [OrderController::class, 'index'])->name('admin.orders.index');
        Route::get('/admin/orders/export', [OrderController::class, 'export'])->name('admin.orders.export');
        Route::get('/admin/orders/{order}', [OrderController::class, 'show'])->name('admin.orders.show');
        Route::get('/admin/orders/{order}/edit', [OrderController::class, 'edit'])->name('admin.orders.edit');
        Route::put('/admin/orders/{order}', [OrderController::class, 'update'])->name('admin.orders.update');
        Route::delete('/admin/orders/{order}', [OrderController::class, 'destroy'])->name('admin.orders.destroy');

        Route::get('/admin/customers', [CustomerController::class, 'index'])->name('admin.customers.index');
        Route::get('/admin/customers/create', [CustomerController::class, 'create'])->name('admin.customers.create');
        Route::post('/admin/customers', [CustomerController::class, 'store'])->name('admin.customers.store');
        Route::get('/admin/customers/{customer}', [CustomerController::class, 'show'])->name('admin.customers.show');
        Route::get('/admin/customers/{customer}/edit', [CustomerController::class, 'edit'])->name('admin.customers.edit');
        Route::put('/admin/customers/{customer}', [CustomerController::class, 'update'])->name('admin.customers.update');
        Route::delete('/admin/customers/{customer}', [CustomerController::class, 'destroy'])->name('admin.customers.destroy');

        Route::get('/admin/categories', [CategoryController::class, 'index'])->name('admin.categories.index');
        Route::get('/admin/categories/create', [CategoryController::class, 'create'])->name('admin.categories.create');
        Route::post('/admin/categories', [CategoryController::class, 'store'])->name('admin.categories.store');
        Route::get('/admin/categories/{category}/edit', [CategoryController::class, 'edit'])->name('admin.categories.edit');
        Route::put('/admin/categories/{category}', [CategoryController::class, 'update'])->name('admin.categories.update');
        Route::delete('/admin/categories/{category}', [CategoryController::class, 'destroy'])->name('admin.categories.destroy');

        Route::get('/admin/brands', [BrandController::class, 'index'])->name('admin.brands.index');
        Route::get('/admin/brands/create', [BrandController::class, 'create'])->name('admin.brands.create');
        Route::post('/admin/brands', [BrandController::class, 'store'])->name('admin.brands.store');
        Route::get('/admin/brands/{brand}/edit', [BrandController::class, 'edit'])->name('admin.brands.edit');
        Route::put('/admin/brands/{brand}', [BrandController::class, 'update'])->name('admin.brands.update');
        Route::delete('/admin/brands/{brand}', [BrandController::class, 'destroy'])->name('admin.brands.destroy');

        Route::get('/admin/coupons', [CouponController::class, 'index'])->name('admin.coupons.index');
        Route::get('/admin/coupons/create', [CouponController::class, 'create'])->name('admin.coupons.create');
        Route::post('/admin/coupons', [CouponController::class, 'store'])->name('admin.coupons.store');
        Route::get('/admin/coupons/{coupon}/edit', [CouponController::class, 'edit'])->name('admin.coupons.edit');
        Route::put('/admin/coupons/{coupon}', [CouponController::class, 'update'])->name('admin.coupons.update');
        Route::delete('/admin/coupons/{coupon}', [CouponController::class, 'destroy'])->name('admin.coupons.destroy');

        Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users.index');
        Route::get('/admin/users/create', [UserController::class, 'create'])->name('admin.users.create');
        Route::post('/admin/users', [UserController::class, 'store'])->name('admin.users.store');
        Route::get('/admin/users/{user}/edit', [UserController::class, 'edit'])->name('admin.users.edit');
        Route::put('/admin/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
        Route::delete('/admin/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');

        Route::get('/admin/payment-settings', [AdminPaymentSettingController::class, 'index'])->name('admin.payment-settings.index');
        Route::put('/admin/payment-settings', [AdminPaymentSettingController::class, 'update'])->name('admin.payment-settings.update');

        Route::get('/admin/reviews', [AdminReviewController::class, 'index'])->name('admin.reviews.index');
        Route::get('/admin/reviews/{review}/edit', [AdminReviewController::class, 'edit'])->name('admin.reviews.edit');
        Route::put('/admin/reviews/{review}', [AdminReviewController::class, 'update'])->name('admin.reviews.update');
        Route::delete('/admin/reviews/{review}', [AdminReviewController::class, 'destroy'])->name('admin.reviews.destroy');
    });

    Route::middleware('role:staff')->group(function () {
        Route::get('/staff/dashboard', [StaffController::class, 'dashboard'])->name('staff.dashboard');

        Route::get('/staff/orders', [StaffOrdersController::class, 'index'])->name('staff.orders.index');
        Route::get('/staff/orders/export', [StaffOrdersController::class, 'export'])->name('staff.orders.export');
        Route::get('/staff/orders/{order}', [StaffOrdersController::class, 'show'])->name('staff.orders.show');
        Route::get('/staff/orders/{order}/edit', [StaffOrdersController::class, 'edit'])->name('staff.orders.edit');
        Route::put('/staff/orders/{order}', [StaffOrdersController::class, 'update'])->name('staff.orders.update');
        Route::delete('/staff/orders/{order}', [StaffOrdersController::class, 'destroy'])->name('staff.orders.destroy');

        Route::get('/staff/coupons', [StaffCouponController::class, 'index'])->name('staff.coupons.index');
        Route::get('/staff/coupons/create', [StaffCouponController::class, 'create'])->name('staff.coupons.create');
        Route::post('/staff/coupons', [StaffCouponController::class, 'store'])->name('staff.coupons.store');
        Route::get('/staff/coupons/{coupon}/edit', [StaffCouponController::class, 'edit'])->name('staff.coupons.edit');
        Route::put('/staff/coupons/{coupon}', [StaffCouponController::class, 'update'])->name('staff.coupons.update');
        Route::delete('/staff/coupons/{coupon}', [StaffCouponController::class, 'destroy'])->name('staff.coupons.destroy');
    });

    Route::middleware('role:customer')->group(function () {
        Route::get('/customer/my-account', [CustomerAccountController::class, 'index'])->name('customer.my-account');
        Route::post('/customer/profile', [CustomerAccountController::class, 'updateProfile'])->name('customer.profile.update');
        Route::post('/customer/address', [CustomerAccountController::class, 'updateAddress'])->name('customer.address.update');
    });
});

require __DIR__.'/settings.php';