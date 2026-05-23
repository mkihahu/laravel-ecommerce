<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Laravel\Fortify\Features;

class CustomerAuthController extends Controller
{
    public function login()
    {
        $navCategories = Category::where('status', 'active')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ]);

        return inertia('customer/auth/login', [
            'canRegister' => Features::enabled(Features::registration()),
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'navCategories' => $navCategories,
        ]);
    }

    public function register()
    {
        $navCategories = Category::where('status', 'active')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(fn ($cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ]);

        return inertia('customer/auth/register', [
            'canRegister' => Features::enabled(Features::registration()),
            'navCategories' => $navCategories,
        ]);
    }
}
