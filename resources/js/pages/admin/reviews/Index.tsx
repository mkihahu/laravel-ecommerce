import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    status: string;
    created_at: string;
    user: { id: number; name: string } | null;
    product: { id: number; name: string; slug: string } | null;
}

interface PaginatedReviews {
    data: Review[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    search?: string;
    status?: string;
}

interface Props {
    reviews: PaginatedReviews;
    filters: Filters;
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
    const sizeClass = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizeClass} ${
                        star <= rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200'
                    }`}
                />
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
        <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}

export default function ReviewsIndex() {
    const { props } = usePage<Props>();
    const { reviews, filters } = props;

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status) params.set('status', status);

        router.get(`/admin/reviews?${params.toString()}`, {}, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get('/admin/reviews', {}, { preserveState: true });
    };

    const handleDelete = () => {
        if (reviewToDelete) {
            router.delete(`/admin/reviews/${reviewToDelete.id}`, {
                onSuccess: () => setIsDialogOpen(false),
            });
        }
    };

    const openDeleteDialog = (review: Review) => {
        setReviewToDelete(review);
        setIsDialogOpen(true);
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (search !== (filters.search || '')) {
                handleFilter();
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    return (
        <>
            <Head title="Reviews" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Reviews</h1>
                        <p className="text-muted-foreground">Manage product reviews and ratings</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card">
                    <div className="p-4 border-b">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by product, user, or comment..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={status} onValueChange={(v) => { setStatus(v); setTimeout(handleFilter, 100); }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            {(search || status) && (
                                <Button variant="ghost" onClick={handleReset}>
                                    <X className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Comment</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reviews.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            <Star className="mx-auto h-8 w-8 mb-2" />
                                            No reviews found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reviews.data.map((review) => (
                                        <TableRow key={review.id}>
                                            <TableCell className="max-w-[200px]">
                                                <Link
                                                    href={`/shop/${review.product?.slug}`}
                                                    className="text-sm font-medium hover:text-orange-500 transition-colors line-clamp-1"
                                                >
                                                    {review.product?.name || 'Deleted Product'}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{review.user?.name || 'Anonymous'}</TableCell>
                                            <TableCell>
                                                <StarRating rating={review.rating} />
                                            </TableCell>
                                            <TableCell className="max-w-[250px]">
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {review.comment || '-'}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                {formatDate(review.created_at)}
                                            </TableCell>
                                            <TableCell><StatusBadge status={review.status} /></TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/admin/reviews/${review.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(review)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {reviews.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Showing {reviews.from} to {reviews.to} of {reviews.total} results
                            </p>
                            <div className="flex gap-1">
                                {reviews.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(link.url, {}, { preserveState: true });
                                            }
                                        }}
                                    >
                                        {link.label.replace('&laquo;', '\u00AB').replace('&raquo;', '\u00BB')}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Review</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this review? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ReviewsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Reviews', href: '/admin/reviews' },
    ],
};
