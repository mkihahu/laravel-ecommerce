<?php

namespace App\Http\Controllers;

use App\Models\Category;

class ContactController extends Controller
{
    public function index()
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

        return inertia('contact', [
            'navCategories' => $navCategories,
        ]);
    }
}
