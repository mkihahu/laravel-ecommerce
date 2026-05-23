<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;

class PaymentSettingController extends Controller
{
    public function index()
    {
        $settings = PaymentSetting::where('group', 'payment')
            ->orderBy('id')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'key' => $s->key,
                'group' => $s->group,
                'value' => $s->value,
            ]);

        return inertia('admin/payment-settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.id' => 'required|exists:payment_settings,id',
            'settings.*.value' => 'nullable|string|max:500',
        ]);

        foreach ($request->settings as $setting) {
            PaymentSetting::where('id', $setting['id'])->update([
                'value' => $setting['value'],
            ]);
        }

        return redirect()->route('admin.payment-settings.index')
            ->with('success', 'Payment settings updated successfully.');
    }
}
