<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title' => 'Summer Sale',
                'subtitle' => 'Up to 30% off on smartphones',
                'image' => 'banners/summer-sale.jpg',
                'button_text' => 'Shop Now',
                'button_link' => '/products?category=smartphones',
                'status' => 'active',
            ],
            [
                'title' => 'New Arrivals',
                'subtitle' => 'Check out the latest gadgets',
                'image' => 'banners/new-arrivals.jpg',
                'button_text' => 'Explore',
                'button_link' => '/products?sort=newest',
                'status' => 'active',
            ],
            [
                'title' => 'Premium Audio',
                'subtitle' => 'Experience sound like never before',
                'image' => 'banners/audio-sale.jpg',
                'button_text' => 'View Deals',
                'button_link' => '/products?category=audio',
                'status' => 'active',
            ],
        ];

        foreach ($banners as $banner) {
            Banner::create($banner);
        }
    }
}
