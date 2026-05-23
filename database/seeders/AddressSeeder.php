<?php

namespace Database\Seeders;

use App\Models\Address;
use Illuminate\Database\Seeder;

class AddressSeeder extends Seeder
{
    public function run(): void
    {
        $addresses = [
            [
                'user_id' => 2,
                'full_name' => 'John Doe',
                'phone' => '+1234567890',
                'country' => 'United States',
                'city' => 'New York',
                'state' => 'NY',
                'zip_code' => '10001',
                'address_line_1' => '123 Main Street, Apt 4B',
                'address_line_2' => 'Near Central Park',
                'type' => 'both',
                'is_default' => true,
            ],
            [
                'user_id' => 2,
                'full_name' => 'John Doe',
                'phone' => '+1234567890',
                'country' => 'United States',
                'city' => 'Los Angeles',
                'state' => 'CA',
                'zip_code' => '90001',
                'address_line_1' => '456 Sunset Boulevard',
                'address_line_2' => null,
                'type' => 'shipping',
                'is_default' => false,
            ],
            [
                'user_id' => 3,
                'full_name' => 'Jane Smith',
                'phone' => '+1987654321',
                'country' => 'United States',
                'city' => 'Chicago',
                'state' => 'IL',
                'zip_code' => '60601',
                'address_line_1' => '789 Michigan Ave',
                'address_line_2' => 'Suite 100',
                'type' => 'both',
                'is_default' => true,
            ],
        ];

        foreach ($addresses as $address) {
            Address::create($address);
        }
    }
}