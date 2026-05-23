import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { storageUrl } from '@/lib/utils';

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    status: string;
    created_at: string;
    user: { id: number; name: string; email: string } | null;
    product: { id: number; name: string; slug: string; thumbnail: string | null } | null;
}

interface Props {
    review: Review;
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => onChange(star)} className="p-0.5">
                    <Star
                        className={`h-7 w-7 ${
                            star <= value ? 'fill-orange-400 text-orange-400' : 'text-gray-300'
                        } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
}

export default function EditReview() {
    const { props } = usePage<Props>();
    const { review } = props;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        rating: review.rating,
        comment: review.comment || '',
        status: review.status,
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(`/admin/reviews/${review.id}`, formData, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Edit Review" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/reviews">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Edit Review</h1>
                        <p className="text-muted-foreground">Update review details and status</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Review Details</h2>

                                {review.product && (
                                    <div className="flex items-center gap-3 pb-4 border-b">
                                        {review.product.thumbnail ? (
                                            <img
                                                src={storageUrl(review.product.thumbnail)}
                                                alt={review.product.name}
                                                className="h-12 w-12 rounded-lg object-cover border"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                                <Star className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">{review.product.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                By {review.user?.name || 'Anonymous'}
                                                {review.user?.email && ` (${review.user.email})`}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Rating</Label>
                                    <StarInput
                                        value={formData.rating}
                                        onChange={(v) => setFormData((prev) => ({ ...prev, rating: v }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="comment">Comment</Label>
                                    <Textarea
                                        id="comment"
                                        rows={5}
                                        value={formData.comment}
                                        onChange={(e) => handleInputChange('comment', e.target.value)}
                                        placeholder="Review comment..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Status</h2>
                                <div className="space-y-2">
                                    <Label>Review Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleInputChange('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="pt-2">
                                    <p className="text-xs text-muted-foreground">
                                        Created: {new Date(review.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Current: <Badge variant="outline">{review.status}</Badge>
                                    </p>
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

EditReview.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Reviews', href: '/admin/reviews' },
        { title: 'Edit Review', href: '' },
    ],
};
