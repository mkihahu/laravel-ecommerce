<?php

namespace Database\Seeders;

use App\Models\Color;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ColorSeeder extends Seeder
{
    public function run(): void
    {
        $colors = [
            ['name' => 'Black', 'hex_code' => '#000000'],
            ['name' => 'White', 'hex_code' => '#FFFFFF'],
            ['name' => 'Blue', 'hex_code' => '#0000FF'],
            ['name' => 'Red', 'hex_code' => '#FF0000'],
            ['name' => 'Green', 'hex_code' => '#008000'],
            ['name' => 'Gold', 'hex_code' => '#FFD700'],
            ['name' => 'Silver', 'hex_code' => '#C0C0C0'],
            ['name' => 'Purple', 'hex_code' => '#800080'],
            ['name' => 'Pink', 'hex_code' => '#FFC0CB'],
            ['name' => 'Gray', 'hex_code' => '#808080'],
            ['name' => 'Dark Grey', 'hex_code' => '#333333'],
        ];

        foreach ($colors as $color) {
            $color['slug'] = Str::slug($color['name']);
            Color::create($color);
        }
    }
}