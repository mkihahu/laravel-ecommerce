<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'type', 'value', 'minimum_amount', 'usage_limit',
        'used_count', 'starts_at', 'expires_at', 'status'
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'minimum_amount' => 'decimal:2',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}