<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'customer')->get();

        if ($users->isEmpty()) {
            return;
        }

        foreach ($users as $user) {
            Notification::create([
                'user_id' => $user->id,
                'title' => 'Order Confirmed',
                'message' => 'Your order has been successfully placed. Order ID: #ORD-1013. Thank you for choosing us.',
                'is_read' => false,
                'created_at' => Carbon::parse('2024-06-24 14:29:00'),
                'updated_at' => Carbon::parse('2024-06-24 14:29:00'),
            ]);
        }
    }
}
