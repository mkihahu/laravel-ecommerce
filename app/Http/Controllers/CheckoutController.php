<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $navCategories = Category::whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ]);

        $cart = Cart::with(['items.product.images', 'items.product.brand'])
            ->where('user_id', $user->id)
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

        $shippingAddress = $user->addresses()->where('type', 'shipping')->first();
        $billingAddress = $user->addresses()->where('type', 'billing')->first();
        $savedAddress = $shippingAddress ?? $billingAddress;

        return Inertia::render('checkout', [
            'navCategories' => $navCategories,
            'cartItems' => $cartItems,
            'savedAddress' => $savedAddress ? [
                'full_name' => $savedAddress->full_name,
                'email' => $savedAddress->email,
                'phone' => $savedAddress->phone,
                'address_line_1' => $savedAddress->address_line_1,
                'city' => $savedAddress->city,
                'zip_code' => $savedAddress->zip_code,
            ] : null,
            'stripeKey' => PaymentSetting::where('key', 'stripe_publishable_key')->value('value'),
            'paypalClientId' => PaymentSetting::where('key', 'paypal_client_id')->value('value'),
        ]);
    }

    public function applyCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:50',
        ]);

        $cart = Cart::with('items.product')
            ->where('user_id', Auth::id())
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['error' => 'Your cart is empty.'], 400);
        }

        $subtotal = $cart->items->sum(fn ($item) => $item->price * $item->quantity);

        $coupon = Coupon::whereRaw('BINARY `code` = ?', [strtoupper($request->code)])
            ->orWhereRaw('BINARY `code` = ?', [$request->code])
            ->first();

        if (!$coupon) {
            return response()->json(['error' => 'Invalid coupon code.'], 404);
        }

        if ($coupon->status !== 'active') {
            return response()->json(['error' => 'This coupon is no longer active.'], 400);
        }

        if ($coupon->starts_at && now()->lt($coupon->starts_at)) {
            return response()->json(['error' => 'This coupon is not yet available.'], 400);
        }

        if ($coupon->expires_at && now()->gt($coupon->expires_at)) {
            return response()->json(['error' => 'This coupon has expired.'], 400);
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json(['error' => 'This coupon has reached its usage limit.'], 400);
        }

        if ($coupon->minimum_amount && $subtotal < $coupon->minimum_amount) {
            return response()->json([
                'error' => 'Minimum order amount of $' . number_format($coupon->minimum_amount, 2) . ' required.'
            ], 400);
        }

        $discount = $coupon->type === 'percentage'
            ? round($subtotal * $coupon->value / 100, 2)
            : min($coupon->value, $subtotal);

        return response()->json([
            'coupon_id' => $coupon->id,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'discount' => $discount,
        ]);
    }

    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.50',
        ]);

        $secretKey = PaymentSetting::where('key', 'stripe_secret_key')->value('value');

        \Stripe\Stripe::setApiKey($secretKey);

        $paymentIntent = \Stripe\PaymentIntent::create([
            'amount' => (int) round($request->amount * 100),
            'currency' => strtolower(PaymentSetting::where('key', 'currency')->value('value') ?? 'usd'),
            'automatic_payment_methods' => ['enabled' => true],
        ]);

        return response()->json([
            'client_secret' => $paymentIntent->client_secret,
        ]);
    }

    private function getPayPalAccessToken(): ?string
    {
        $clientId = PaymentSetting::where('key', 'paypal_client_id')->value('value');
        $secret = PaymentSetting::where('key', 'paypal_client_secret')->value('value');

        if (!$clientId || !$secret) {
            return null;
        }

        $response = Http::withBasicAuth($clientId, $secret)
            ->asForm()
            ->post('https://api-m.sandbox.paypal.com/v1/oauth2/token', [
                'grant_type' => 'client_credentials',
            ]);

        if (!$response->successful()) {
            return null;
        }

        return $response->json('access_token');
    }

    public function createPayPalOrder(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.50',
        ]);

        $accessToken = $this->getPayPalAccessToken();

        if (!$accessToken) {
            return response()->json(['error' => 'PayPal API credentials are not configured correctly.'], 422);
        }

        $currency = PaymentSetting::where('key', 'currency')->value('value') ?? 'USD';

        $response = Http::withToken($accessToken)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post('https://api-m.sandbox.paypal.com/v2/checkout/orders', [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'amount' => [
                        'currency_code' => $currency,
                        'value' => number_format($request->amount, 2, '.', ''),
                    ],
                ]],
            ]);

        if (!$response->successful()) {
            $errorBody = $response->body();
            $errorMessage = 'Failed to create PayPal order.';
            $decoded = json_decode($errorBody, true);
            if (isset($decoded['message'])) {
                $errorMessage .= ' ' . $decoded['message'];
            } elseif (isset($decoded['error_description'])) {
                $errorMessage .= ' ' . $decoded['error_description'];
            }
            return response()->json(['error' => $errorMessage], 422);
        }

        return response()->json([
            'id' => $response->json('id'),
        ]);
    }

    public function capturePayPalOrder(Request $request)
    {
        $request->validate([
            'order_id' => 'required|string',
        ]);

        $accessToken = $this->getPayPalAccessToken();

        if (!$accessToken) {
            return response()->json(['error' => 'PayPal API credentials are not configured correctly.'], 422);
        }

        $response = Http::withToken($accessToken)
            ->withBody('{}', 'application/json')
            ->post("https://api-m.sandbox.paypal.com/v2/checkout/orders/{$request->order_id}/capture");

        if (!$response->successful()) {
            $errorBody = $response->body();
            $errorMessage = 'Failed to capture PayPal order.';
            $decoded = json_decode($errorBody, true);
            if (isset($decoded['message'])) {
                $errorMessage .= ' ' . $decoded['message'];
            } elseif (isset($decoded['error_description'])) {
                $errorMessage .= ' ' . $decoded['error_description'];
            }
            if (isset($decoded['details'][0]['description'])) {
                $errorMessage .= ' ' . $decoded['details'][0]['description'];
            }
            return response()->json(['error' => $errorMessage], 422);
        }

        $data = $response->json();

        if (($data['status'] ?? '') !== 'COMPLETED') {
            return response()->json(['error' => 'PayPal payment was not completed.'], 422);
        }

        $captureId = $data['purchase_units'][0]['payments']['captures'][0]['id'] ?? null;

        return response()->json([
            'status' => 'COMPLETED',
            'capture_id' => $captureId,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $cart = Cart::with('items.product')
            ->where('user_id', $user->id)
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return redirect()->route('cart.page')->with('error', 'Your cart is empty.');
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'zip' => 'required|string|max:20',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'notes' => 'nullable|string|max:1000',
            'payment_method' => 'required|in:cash,card,paypal',
            'coupon_id' => 'integer',
            'stripe_payment_intent_id' => 'nullable|string',
            'paypal_capture_id' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $address = Address::create([
                'user_id' => $user->id,
                'full_name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'phone' => $validated['phone'],
                'address_line_1' => $validated['address'],
                'city' => $validated['city'],
                'zip_code' => $validated['zip'],
                'country' => 'US',
                'type' => 'shipping',
            ]);

            $subtotal = $cart->items->sum(fn ($item) => $item->price * $item->quantity);
            $shippingFee = 0;

            $coupon = null;
            $discount = 0;
            $couponId = $validated['coupon_id'] ?: null;
            if ($couponId) {
                $coupon = Coupon::find($couponId);
                if ($coupon && $coupon->status === 'active') {
                    $discount = $coupon->type === 'percentage'
                        ? round($subtotal * $coupon->value / 100, 2)
                        : min($coupon->value, $subtotal);
                }
            }

            $tax = ($subtotal - $discount) * 0.1;
            $total = $subtotal - $discount + $shippingFee + $tax;

            $orderNumber = 'ORD-' . strtoupper(uniqid());

            $paymentStatus = in_array($validated['payment_method'], ['card', 'paypal']) ? 'paid' : 'pending';

            $order = Order::create([
                'user_id' => $user->id,
                'address_id' => $address->id,
                'coupon_id' => $couponId,
                'order_number' => $orderNumber,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping_fee' => $shippingFee,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $paymentStatus,
                'notes' => $validated['notes'],
                'order_status' => 'pending',
                'placed_at' => now(),
            ]);

            if ($validated['payment_method'] === 'card') {
                $paymentIntentId = $validated['stripe_payment_intent_id'] ?? null;
                if (!$paymentIntentId) {
                    throw new \Exception('Missing payment intent ID.');
                }

                $secretKey = PaymentSetting::where('key', 'stripe_secret_key')->value('value');
                \Stripe\Stripe::setApiKey($secretKey);

                $paymentIntent = \Stripe\PaymentIntent::retrieve($paymentIntentId);

                if ($paymentIntent->status !== 'succeeded') {
                    throw new \Exception('Payment was not completed. Please try again.');
                }

                Payment::create([
                    'order_id' => $order->id,
                    'payment_method' => 'card',
                    'transaction_id' => $paymentIntentId,
                    'amount' => $total,
                    'currency' => strtoupper(PaymentSetting::where('key', 'currency')->value('value') ?? 'USD'),
                    'status' => 'completed',
                    'paid_at' => now(),
                ]);
            } elseif ($validated['payment_method'] === 'paypal') {
                $captureId = $validated['paypal_capture_id'] ?? null;
                if (!$captureId) {
                    throw new \Exception('Missing PayPal capture ID.');
                }

                Payment::create([
                    'order_id' => $order->id,
                    'payment_method' => 'paypal',
                    'transaction_id' => $captureId,
                    'amount' => $total,
                    'currency' => strtoupper(PaymentSetting::where('key', 'currency')->value('value') ?? 'USD'),
                    'status' => 'completed',
                    'paid_at' => now(),
                ]);
            }

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->price * $item->quantity,
                ]);
            }

            $cart->items()->delete();

            if ($coupon) {
                $coupon->increment('used_count');
            }

            \App\Models\Notification::create([
                'user_id' => $user->id,
                'title' => 'Order Confirmed',
                'message' => 'Your order has been successfully placed. Order ID: #' . $orderNumber . '. Thank you for choosing us.',
                'is_read' => false,
            ]);

            DB::commit();

            return redirect()->route('checkout.success', $order->id);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to place order. Please try again.');
        }
    }

    public function success($orderId)
    {
        $user = Auth::user();

        $order = Order::with('items.product.images', 'items.product.brand', 'address')
            ->where('user_id', $user->id)
            ->findOrFail($orderId);

        $navCategories = Category::whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ]);

        return Inertia::render('checkout/success', [
            'navCategories' => $navCategories,
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'subtotal' => (float) $order->subtotal,
                'discount' => (float) $order->discount,
                'shipping_fee' => (float) $order->shipping_fee,
                'tax' => (float) $order->tax,
                'total' => (float) $order->total,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'order_status' => $order->order_status,
                'placed_at' => $order->placed_at ? $order->placed_at->format('M d, Y g:i A') : '',
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                    'total' => (float) $item->total,
                    'image' => $item->product->images->first()->image ?? $item->product->thumbnail,
                ]),
                'shipping_address' => $order->address ? [
                    'full_name' => $order->address->full_name,
                    'address_line_1' => $order->address->address_line_1,
                    'city' => $order->address->city,
                    'zip_code' => $order->address->zip_code,
                ] : null,
            ],
        ]);
    }
}
