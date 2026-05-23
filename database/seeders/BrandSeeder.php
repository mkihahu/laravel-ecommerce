<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Apple', 'slug' => 'apple', 'description' => 'Premium electronics brand', 'status' => 1],
            ['name' => 'Samsung', 'slug' => 'samsung', 'description' => 'Leading electronics manufacturer', 'status' => 1],
            ['name' => 'Sony', 'slug' => 'sony', 'description' => 'Japanese electronics giant', 'status' => 1],
            ['name' => 'LG', 'slug' => 'lg', 'description' => 'Consumer electronics and appliances', 'status' => 1],
            ['name' => 'Dell', 'slug' => 'dell', 'description' => 'Computer hardware company', 'status' => 1],
            ['name' => 'HP', 'slug' => 'hp', 'description' => 'Personal computing solutions', 'status' => 1],
            ['name' => 'Bose', 'slug' => 'bose', 'description' => 'Premium audio equipment', 'status' => 1],
            ['name' => 'Canon', 'slug' => 'canon', 'description' => 'Camera and imaging equipment', 'status' => 1],
        ];

        foreach ($brands as $brand) {
            Brand::create($brand);
        }
    }
}
