<?php

namespace Database\Seeders;

use App\Models\ProductSpecification;
use Illuminate\Database\Seeder;

class ProductSpecificationSeeder extends Seeder
{
    public function run(): void
    {
        $specs = [
            ['product_id' => 1, 'spec_key' => 'Display', 'spec_value' => '6.8" Dynamic AMOLED 2X'],
            ['product_id' => 1, 'spec_key' => 'Processor', 'spec_value' => 'Snapdragon 8 Gen 3'],
            ['product_id' => 1, 'spec_key' => 'RAM', 'spec_value' => '12GB'],
            ['product_id' => 1, 'spec_key' => 'Battery', 'spec_value' => '5000mAh'],
            ['product_id' => 1, 'spec_key' => 'Camera', 'spec_value' => '200MP Main + 50MP Ultra Wide'],
            ['product_id' => 2, 'spec_key' => 'Display', 'spec_value' => '6.7" Super Retina XDR'],
            ['product_id' => 2, 'spec_key' => 'Processor', 'spec_value' => 'A17 Pro'],
            ['product_id' => 2, 'spec_key' => 'RAM', 'spec_value' => '8GB'],
            ['product_id' => 2, 'spec_key' => 'Battery', 'spec_value' => '4422mAh'],
            ['product_id' => 2, 'spec_key' => 'Camera', 'spec_value' => '48MP Main + 12MP Ultra Wide + 12MP Telephoto'],
            ['product_id' => 3, 'spec_key' => 'Display', 'spec_value' => '15.6" 3.5K OLED'],
            ['product_id' => 3, 'spec_key' => 'Processor', 'spec_value' => 'Intel Core i7-13700H'],
            ['product_id' => 3, 'spec_key' => 'RAM', 'spec_value' => '16GB DDR5'],
            ['product_id' => 3, 'spec_key' => 'Storage', 'spec_value' => '512GB SSD'],
            ['product_id' => 3, 'spec_key' => 'Graphics', 'spec_value' => 'NVIDIA RTX 4060'],
        ];

        foreach ($specs as $spec) {
            ProductSpecification::create($spec);
        }
    }
}
