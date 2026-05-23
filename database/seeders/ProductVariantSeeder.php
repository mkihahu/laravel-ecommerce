<?php

namespace Database\Seeders;

use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ProductVariantSeeder extends Seeder
{
    public function run(): void
    {
        $variants = [
            ['product_id' => 1, 'variant_name' => 'Storage', 'variant_value' => '256GB', 'sku' => 'SM-S928B-256', 'price' => 1099.99, 'stock' => 20],
            ['product_id' => 1, 'variant_name' => 'Storage', 'variant_value' => '512GB', 'sku' => 'SM-S928B-512', 'price' => 1199.99, 'stock' => 15],
            ['product_id' => 1, 'variant_name' => 'Storage', 'variant_value' => '1TB', 'sku' => 'SM-S928B-1TB', 'price' => 1379.99, 'stock' => 10],
            ['product_id' => 2, 'variant_name' => 'Storage', 'variant_value' => '256GB', 'sku' => 'IP15PM-256', 'price' => 1199.00, 'stock' => 10],
            ['product_id' => 2, 'variant_name' => 'Storage', 'variant_value' => '512GB', 'sku' => 'IP15PM-512', 'price' => 1399.00, 'stock' => 10],
            ['product_id' => 2, 'variant_name' => 'Storage', 'variant_value' => '1TB', 'sku' => 'IP15PM-1TB', 'price' => 1599.00, 'stock' => 10],
            ['product_id' => 3, 'variant_name' => 'RAM', 'variant_value' => '16GB', 'sku' => 'XPS-15-16GB', 'price' => 1699.99, 'stock' => 10],
            ['product_id' => 3, 'variant_name' => 'RAM', 'variant_value' => '32GB', 'sku' => 'XPS-15-32GB', 'price' => 2099.99, 'stock' => 5],
            ['product_id' => 5, 'variant_name' => 'Color', 'variant_value' => 'Black', 'sku' => 'QC-ULTRA-BLK', 'price' => 379.00, 'stock' => 20],
            ['product_id' => 5, 'variant_name' => 'Color', 'variant_value' => 'White', 'sku' => 'QC-ULTRA-WHT', 'price' => 379.00, 'stock' => 15],
        ];

        foreach ($variants as $variant) {
            ProductVariant::create($variant);
        }
    }
}
