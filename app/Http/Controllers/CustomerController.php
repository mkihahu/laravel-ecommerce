<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $status = $request->get('status', '');

        $customers = User::where('role', 'customer')
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($status, function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->withCount('orders')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return inertia('admin/customers/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        return inertia('admin/customers/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] = 'customer';

        $customer = User::create($validated);

        return redirect()->route('admin.customers.index')->with('success', 'Customer created successfully');
    }

    public function show(User $customer)
    {
        abort_unless($customer->role === 'customer', 404);

        $customer->load(['orders' => function ($query) {
            $query->with(['items.product', 'address'])
                ->orderByDesc('created_at')
                ->paginate(15);
        }]);

        $orders = $customer->orders();

        return inertia('admin/customers/Show', [
            'customer' => $customer,
            'orders' => $orders->with(['items.product', 'address'])->orderByDesc('created_at')->paginate(15),
        ]);
    }

    public function edit(User $customer)
    {
        abort_unless($customer->role === 'customer', 404);

        return inertia('admin/customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request, User $customer)
    {
        abort_unless($customer->role === 'customer', 404);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $customer->id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive',
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $customer->update($validated);

        return redirect()->route('admin.customers.index')->with('success', 'Customer updated successfully');
    }

    public function destroy(User $customer)
    {
        abort_unless($customer->role === 'customer', 404);

        $customer->orders()->delete();
        $customer->addresses()->delete();
        $customer->delete();

        return redirect()->route('admin.customers.index')->with('success', 'Customer deleted successfully');
    }
}
