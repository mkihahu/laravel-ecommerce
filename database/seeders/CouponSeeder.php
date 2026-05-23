<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME20',
                'type' => 'percentage',
                'value' => 20,
                'minimum_amount' => 100.00,
                'usage_limit' => 100,
                'used_count' => 0,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonths(3),
                'status' => 'active'
            ],
            [
                'code' => 'SAVE50',
                'type' => 'fixed',
                'value' => 50.00,
                'minimum_amount' => 500.00,
                'usage_limit' => 50,
                'used_count' => 5,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonth(),
                'status' => 'active'
            ],
            [
                'code' => 'FREESHIP',
                'type' => 'fixed',
                'value' => 0,
                'minimum_amount' => 200.00,
                'usage_limit' => 200,
                'used_count' => 20,
                'starts_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addMonths(2),
                'status' => 'active'
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::create($coupon);
        }
    }
}