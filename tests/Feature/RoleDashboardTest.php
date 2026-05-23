<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('guests are redirected to login for admin dashboard', function () {
    $response = $this->get(route('admin.dashboard'));
    $response->assertRedirect(route('login'));
});

test('guests are redirected to login for staff dashboard', function () {
    $response = $this->get(route('staff.dashboard'));
    $response->assertRedirect(route('login'));
});

test('admin users can visit the admin dashboard', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertOk();
});

test('staff users can visit the staff dashboard', function () {
    $user = User::factory()->create(['role' => 'staff']);

    $this->actingAs($user)
        ->get(route('staff.dashboard'))
        ->assertOk();
});

test('admin users are redirected to admin dashboard', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));
});

test('staff users are redirected to staff dashboard', function () {
    $user = User::factory()->create(['role' => 'staff']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('staff.dashboard'));
});

test('staff users cannot access the admin dashboard', function () {
    $user = User::factory()->create(['role' => 'staff']);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admin users cannot access the staff dashboard', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)
        ->get(route('staff.dashboard'))
        ->assertForbidden();
});

test('customer users are redirected to home', function () {
    $user = User::factory()->create(['role' => 'customer']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('home'));
});

test('customer users cannot access admin dashboard', function () {
    $user = User::factory()->create(['role' => 'customer']);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});
