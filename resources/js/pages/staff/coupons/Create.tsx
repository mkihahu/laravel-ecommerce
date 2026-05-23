import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function CreateCoupon() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        type: 'fixed',
        value: '',
        minimum_amount: '',
        usage_limit: '',
        starts_at: '',
        expires_at: '',
        status: 'active',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== '') {
                data.append(key, value);
            }
        });

        router.post('/staff/coupons', data, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Add Coupon" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/staff/coupons">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Add Coupon</h1>
                        <p className="text-muted-foreground">Create a new discount coupon</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Coupon Details</h2>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Coupon Code *</Label>
                                        <Input
                                            id="code"
                                            value={formData.code}
                                            onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                                            placeholder="e.g., SAVE20"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type *</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => handleInputChange('type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                                                <SelectItem value="percentage">Percentage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="value">Value *</Label>
                                        <Input
                                            id="value"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.value}
                                            onChange={(e) => handleInputChange('value', e.target.value)}
                                            placeholder={formData.type === 'percentage' ? 'e.g., 20' : 'e.g., 10.00'}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="minimum_amount">Minimum Order Amount</Label>
                                        <Input
                                            id="minimum_amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.minimum_amount}
                                            onChange={(e) => handleInputChange('minimum_amount', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="usage_limit">Usage Limit</Label>
                                        <Input
                                            id="usage_limit"
                                            type="number"
                                            min="1"
                                            value={formData.usage_limit}
                                            onChange={(e) => handleInputChange('usage_limit', e.target.value)}
                                            placeholder="Leave empty for unlimited"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Validity Period</h2>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="starts_at">Start Date</Label>
                                        <Input
                                            id="starts_at"
                                            type="datetime-local"
                                            value={formData.starts_at}
                                            onChange={(e) => handleInputChange('starts_at', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expires_at">Expiration Date</Label>
                                        <Input
                                            id="expires_at"
                                            type="datetime-local"
                                            value={formData.expires_at}
                                            onChange={(e) => handleInputChange('expires_at', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Status</h2>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Coupon'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

CreateCoupon.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/staff/dashboard' },
        { title: 'Coupons', href: '/staff/coupons' },
        { title: 'Add Coupon', href: '/staff/coupons/create' },
    ],
};
