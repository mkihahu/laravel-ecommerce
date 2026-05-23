<?php

namespace Database\Seeders;

use App\Models\Capacity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CapacitySeeder extends Seeder
{
    public function run(): void
    {
        $capacities = [
            ['name' => '32GB', 'label' => '32 GB'],
            ['name' => '64GB', 'label' => '64 GB'],
            ['name' => '128GB', 'label' => '128 GB'],
            ['name' => '256GB', 'label' => '256 GB'],
            ['name' => '512GB', 'label' => '512 GB'],
            ['name' => '1TB', 'label' => '1 TB'],
        ];

        foreach ($capacities as $capacity) {
            $capacity['slug'] = Str::slug($capacity['name']);
            Capacity::create($capacity);
        }
    }
}
