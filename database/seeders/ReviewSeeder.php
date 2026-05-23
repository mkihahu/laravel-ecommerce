<?php

namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $reviews = [
            [
                'user_id' => 2,
                'product_id' => 1,
                'rating' => 5,
                'comment' => 'The best electronics store I\'ve found online. Fast shipping, genuine products, and excellent customer support. Every gadget I\'ve purchased has been flawless!',
                'status' => 'approved',
            ],
            [
                'user_id' => 4,
                'product_id' => 2,
                'rating' => 5,
                'comment' => 'Incredible selection of premium tech. The product I ordered arrived in perfect condition with all original accessories. Highly recommend for anyone looking for quality electronics.',
                'status' => 'approved',
            ],
            [
                'user_id' => 5,
                'product_id' => 3,
                'rating' => 5,
                'comment' => 'My go-to store for camera gear and accessories. Competitive prices, authentic products, and the warranty support is top-notch. They truly understand tech enthusiasts.',
                'status' => 'approved',
            ],
            [
                'user_id' => 6,
                'product_id' => 4,
                'rating' => 4,
                'comment' => 'Good product but shipping took a bit longer than expected.',
                'status' => 'approved',
            ],
            [
                'user_id' => 2,
                'product_id' => 5,
                'rating' => 3,
                'comment' => 'Product is okay but not as described.',
                'status' => 'pending',
            ],
        ];

        foreach ($reviews as $review) {
            Review::create($review);
        }
    }
}
