<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'category_id' => 1, 'brand_id' => 2, 'name' => 'Samsung Galaxy S24 Ultra',
                'slug' => 'samsung-galaxy-s24-ultra', 'sku' => 'SM-S928B',
                'short_description' => 'The ultimate Galaxy experience with AI features',
                'description' => 'Experience the future of smartphones with Samsung Galaxy S24 Ultra featuring advanced AI capabilities.',
                'price' => 1199.99, 'sale_price' => 1099.99, 'stock' => 50,
                'thumbnail' => 'products/samsung-s24.jpg', 'weight' => 0.232, 'warranty' => '1 Year',
                'featured' => true, 'status' => 'active', 'views' => 1000
            ],
            [
                'category_id' => 1, 'brand_id' => 1, 'name' => 'iPhone 15 Pro Max',
                'slug' => 'iphone-15-pro-max', 'sku' => 'IP15PM-256',
                'short_description' => 'Titanium design with A17 Pro chip',
                'description' => 'The most powerful iPhone ever with titanium design and advanced camera system.',
                'price' => 1199.00, 'sale_price' => null, 'stock' => 30,
                'thumbnail' => 'products/iphone-15.jpg', 'weight' => 0.221, 'warranty' => '1 Year',
                'featured' => true, 'status' => 'active', 'views' => 1500
            ],
            [
                'category_id' => 2, 'brand_id' => 5, 'name' => 'Dell XPS 15',
                'slug' => 'dell-xps-15', 'sku' => 'XPS-15-9530',
                'short_description' => 'Premium Windows laptop with stunning display',
                'description' => 'Dell XPS 15 features a beautiful 15.6-inch display and powerful performance.',
                'price' => 1899.99, 'sale_price' => 1699.99, 'stock' => 20,
                'thumbnail' => 'products/dell-xps.jpg', 'weight' => 1.85, 'warranty' => '2 Year',
                'featured' => true, 'status' => 'active', 'views' => 800
            ],
            [
                'category_id' => 3, 'brand_id' => 1, 'name' => 'iPad Pro 12.9',
                'slug' => 'ipad-pro-12-9', 'sku' => 'IPAD-PRO-12-256',
                'short_description' => 'Ultimate iPad experience with M2 chip',
                'description' => 'The most advanced iPad ever with M2 chip and Liquid Retina XDR display.',
                'price' => 1099.00, 'sale_price' => null, 'stock' => 25,
                'thumbnail' => 'products/ipad-pro.jpg', 'weight' => 0.682, 'warranty' => '1 Year',
                'featured' => true, 'status' => 'active', 'views' => 600
            ],
            [
                'category_id' => 4, 'brand_id' => 7, 'name' => 'Bose QuietComfort Ultra',
                'slug' => 'bose-quietcomfort-ultra', 'sku' => 'QC-ULTRA-001',
                'short_description' => 'Premium noise-cancelling headphones',
                'description' => 'World-class noise cancellation and immersive audio experience.',
                'price' => 429.00, 'sale_price' => 379.00, 'stock' => 40,
                'thumbnail' => 'products/bose-qc.jpg', 'weight' => 0.250, 'warranty' => '2 Year',
                'featured' => true, 'status' => 'active', 'views' => 900
            ],
            [
                'category_id' => 5, 'brand_id' => 8, 'name' => 'Canon EOS R6 Mark II',
                'slug' => 'canon-eos-r6-mark-ii', 'sku' => 'EOS-R6-II',
                'short_description' => 'Full-frame mirrorless camera',
                'description' => 'Professional full-frame mirrorless camera with advanced features.',
                'price' => 2499.00, 'sale_price' => null, 'stock' => 10,
                'thumbnail' => 'products/canon-r6.jpg', 'weight' => 0.670, 'warranty' => '2 Year',
                'featured' => true, 'status' => 'active', 'views' => 400
            ],
        ];

        foreach ($products as $product) {
            $product['slug'] = Str::slug($product['name']);
            Product::create($product);
        }
    }
}