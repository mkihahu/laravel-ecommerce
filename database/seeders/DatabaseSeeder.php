<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            BrandSeeder::class,
            ProductSeeder::class,
            ProductImageSeeder::class,
            ReviewSeeder::class,
            ProductVariantSeeder::class,
            ProductSpecificationSeeder::class,
            BannerSeeder::class,
            CouponSeeder::class,
            PaymentSettingSeeder::class,
            AddressSeeder::class,
            OrderSeeder::class,
            ColorSeeder::class,
            CapacitySeeder::class,
            NotificationSeeder::class,
        ]);
    }
}