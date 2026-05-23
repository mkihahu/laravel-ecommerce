<?php

namespace Database\Seeders;

use App\Models\PaymentSetting;
use Illuminate\Database\Seeder;

class PaymentSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'stripe_publishable_key', 'group' => 'payment', 'value' => 'pk_test_12345'],
            ['key' => 'stripe_secret_key', 'group' => 'payment', 'value' => 'sk_test_12345'],
            ['key' => 'paypal_client_id', 'group' => 'payment', 'value' => 'test_client_id'],
            ['key' => 'paypal_client_secret', 'group' => 'payment', 'value' => 'test_client_secret'],
            ['key' => 'currency', 'group' => 'payment', 'value' => 'USD'],
            ['key' => 'tax_rate', 'group' => 'payment', 'value' => '10'],
        ];

        foreach ($settings as $setting) {
            PaymentSetting::create($setting);
        }
    }
}