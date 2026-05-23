<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $column = $table->enum('payment_method', ['card', 'cash', 'paypal'])->after('total');

            if (Schema::getConnection()->getDriverName() !== 'sqlite') {
                $column->collation('utf8mb4_unicode_ci');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('payment_method');
        });
    }
};
