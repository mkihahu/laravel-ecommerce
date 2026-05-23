<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Smartphones', 'slug' => 'smartphones', 'description' => 'Latest smartphones and mobile phones', 'parent_id' => null],
            ['name' => 'Laptops', 'slug' => 'laptops', 'description' => 'Premium laptops and notebooks', 'parent_id' => null],
            ['name' => 'Tablets', 'slug' => 'tablets', 'description' => 'Android and iOS tablets', 'parent_id' => null],
            ['name' => 'Audio', 'slug' => 'audio', 'description' => 'Headphones, speakers, and audio accessories', 'parent_id' => null],
            ['name' => 'Cameras', 'slug' => 'cameras', 'description' => 'Digital cameras and camcorders', 'parent_id' => null],
            ['name' => 'Gaming', 'slug' => 'gaming', 'description' => 'Gaming consoles and accessories', 'parent_id' => null],
            ['name' => 'Smart Home', 'slug' => 'smart-home', 'description' => 'Smart home devices and automation', 'parent_id' => null],
            ['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Phone and laptop accessories', 'parent_id' => null],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}