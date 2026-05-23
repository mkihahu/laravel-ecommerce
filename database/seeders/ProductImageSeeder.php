<?php

namespace Database\Seeders;

use App\Models\ProductImage;
use Illuminate\Database\Seeder;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        $images = [
            ['product_id' => 1, 'image' => 'products/samsung-s24-1.jpg'],
            ['product_id' => 1, 'image' => 'products/samsung-s24-2.jpg'],
            ['product_id' => 2, 'image' => 'products/iphone-15-1.jpg'],
            ['product_id' => 2, 'image' => 'products/iphone-15-2.jpg'],
            ['product_id' => 3, 'image' => 'products/dell-xps-1.jpg'],
            ['product_id' => 4, 'image' => 'products/ipad-pro-1.jpg'],
            ['product_id' => 5, 'image' => 'products/bose-qc-1.jpg'],
            ['product_id' => 6, 'image' => 'products/canon-r6-1.jpg'],
        ];

        foreach ($images as $image) {
            ProductImage::create($image);
        }
    }
}
