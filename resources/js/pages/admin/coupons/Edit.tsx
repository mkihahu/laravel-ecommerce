import { Head, Link, router, usePage } from '@inertiajs/react';
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

interface Coupon {
    id: number;
    code: string;
    type: string;
    value: string;
    minimum_amount: string | null;
    usage_limit: number | null;
    used_count: number;
    starts_at: string | null;
    expires_at: string | null;
    status: string;
}

interface Props {
    coupon: Coupon;
}

function toLocalDateTime(date: string | null): string {
    if (!date) return '';
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
}

export default function EditCoupon() {
    const { props } = usePage<Props>();
    const { coupon } = props;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minimum_amount: coupon.minimum_amount || '',
        usage_limit: coupon.usage_limit?.toString() || '',
        starts_at: toLocalDateTime(coupon.starts_at),
        expires_at: toLocalDateTime(coupon.expires_at),
        status: coupon.status,
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

        router.put(`/admin/coupons/${coupon.id}`, data, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <>
            <Head title={`Edit ${coupon.code}`} />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/coupons">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Edit Coupon</h1>
                        <p className="text-muted-foreground">Update coupon details</p>
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
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Used Count</Label>
                                        <p className="text-lg font-medium">{coupon.used_count}</p>
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
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

EditCoupon.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Coupons', href: '/admin/coupons' },
        { title: 'Edit Coupon', href: '' },
    ],
};
