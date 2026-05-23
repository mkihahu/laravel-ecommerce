<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Product;
use App\Models\Address;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'customer')->get();
        $products = Product::all();

        if ($users->isEmpty() || $products->isEmpty()) {
            return;
        }

        $addresses = Address::all();

        $orderStatuses = ['pending', 'processing', 'shipped', 'delivered'];
        $paymentStatuses = ['pending', 'paid', 'failed'];

        for ($i = 0; $i < 25; $i++) {
            $user = $users->random();
            $address = $addresses->where('user_id', $user->id)->first() ?? $addresses->first();
            $createdAt = Carbon::now()->subDays(rand(0, 14))->subHours(rand(0, 23));

            $items = [];
            $subtotal = 0;
            $itemCount = rand(1, 3);

            for ($j = 0; $j < $itemCount; $j++) {
                $product = $products->random();
                $quantity = rand(1, 3);
                $price = $product->sale_price ?? $product->price;
                $items[] = [
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $price,
                    'total' => $price * $quantity,
                ];
                $subtotal += $price * $quantity;
            }

            $discount = $subtotal > 500 ? rand(10, 50) : 0;
            $shippingFee = $subtotal > 200 ? 0 : 15;
            $tax = $subtotal * 0.1;
            $total = $subtotal - $discount + $shippingFee + $tax;

            $order = Order::create([
                'user_id' => $user->id,
                'address_id' => $address?->id ?? 1,
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping_fee' => $shippingFee,
                'tax' => $tax,
                'total' => $total,
                'payment_status' => 'paid',
                'order_status' => $orderStatuses[array_rand($orderStatuses)],
                'placed_at' => $createdAt,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            foreach ($items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['total'],
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }
        }
    }
}