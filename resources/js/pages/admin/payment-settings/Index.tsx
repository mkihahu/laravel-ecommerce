import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Wallet, Settings2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Setting {
    id: number;
    key: string;
    group: string;
    value: string | null;
}

interface Props {
    settings: Setting[];
}

const keyLabels: Record<string, string> = {
    stripe_publishable_key: 'Stripe Publishable Key',
    stripe_secret_key: 'Stripe Secret Key',
    paypal_client_id: 'PayPal Client ID',
    paypal_client_secret: 'PayPal Client Secret',
    currency: 'Currency',
    tax_rate: 'Tax Rate (%)',
};

const keyDescriptions: Record<string, string> = {
    stripe_publishable_key: 'Your Stripe publishable key (starts with pk_)',
    stripe_secret_key: 'Your Stripe secret key (starts with sk_)',
    paypal_client_id: 'Your PayPal client ID',
    paypal_client_secret: 'Your PayPal client secret',
    currency: 'Default currency code (e.g. USD, EUR)',
    tax_rate: 'Default tax rate percentage applied to orders',
};

function getGroupIcon(key: string) {
    if (key.startsWith('stripe')) return CreditCard;
    if (key.startsWith('paypal')) return Wallet;
    return Settings2;
}

function getGroupName(key: string): string {
    if (key.startsWith('stripe')) return 'Stripe';
    if (key.startsWith('paypal')) return 'PayPal';
    return 'General';
}

const sensitiveKeys = ['stripe_secret_key', 'stripe_publishable_key', 'paypal_client_id', 'paypal_client_secret'];

export default function PaymentSettingsIndex() {
    const { props } = usePage<Props>();
    const { settings } = props;

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const initial: Record<string, string> = {};
        settings.forEach((s) => {
            initial[s.key] = s.value || '';
        });
        setFormData(initial);
    }, [settings]);

    const handleChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const toggleVisibility = (key: string) => {
        setVisibleKeys((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = settings.map((s) => ({
            id: s.id,
            value: formData[s.key] ?? '',
        }));

        router.put('/admin/payment-settings', { settings: payload }, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
        const group = getGroupName(s.key);
        if (!acc[group]) acc[group] = [];
        acc[group].push(s);
        return acc;
    }, {});

    const groupOrder = ['Stripe', 'PayPal', 'General'];

    return (
        <>
            <Head title="Payment Settings" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/admin/dashboard">
                            <ArrowLeft className="h-5 w-5" />
                        </a>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Payment Settings</h1>
                        <p className="text-muted-foreground">Configure payment gateway credentials and general settings</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {groupOrder.map((groupName) => {
                        const groupSettings = grouped[groupName];
                        if (!groupSettings) return null;
                        const Icon = getGroupIcon(groupSettings[0].key);

                        return (
                            <div key={groupName} className="rounded-xl border bg-card p-6 space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                    <h2 className="text-lg font-semibold">{groupName}</h2>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {groupSettings.map((setting) => {
                                        const isSensitive = sensitiveKeys.includes(setting.key);

                                        return (
                                            <div key={setting.id} className="space-y-2">
                                                <Label htmlFor={setting.key}>
                                                    {keyLabels[setting.key] || setting.key}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id={setting.key}
                                                        type={isSensitive && !visibleKeys[setting.key] ? 'password' : 'text'}
                                                        value={formData[setting.key] ?? ''}
                                                        onChange={(e) => handleChange(setting.key, e.target.value)}
                                                    />
                                                    {isSensitive && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleVisibility(setting.key)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                        >
                                                            {visibleKeys[setting.key] ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                                {keyDescriptions[setting.key] && (
                                                    <p className="text-xs text-muted-foreground">{keyDescriptions[setting.key]}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
                            {isSubmitting ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

PaymentSettingsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Payment Settings', href: '/admin/payment-settings' },
    ],
};
