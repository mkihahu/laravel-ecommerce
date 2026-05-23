import { Head, usePage, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import products from '@/routes/admin/products';
import { edit as editProductRoute } from '@/routes/admin/products';
import { storageUrl } from '@/lib/utils';

interface ProductImage {
    id: number;
    image: string;
}

interface ProductSpecification {
    id: number;
    spec_key: string;
    spec_value: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    short_description: string;
    description: string;
    price: number;
    sale_price: number | null;
    stock: number;
    thumbnail: string | null;
    weight: number | null;
    warranty: string | null;
    featured: boolean;
    status: string;
    views: number;
    category: { id: number; name: string } | null;
    brand: { id: number; name: string } | null;
    images: ProductImage[];
    specifications: ProductSpecification[];
}

interface Props {
    product: Product;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

export default function ShowProduct() {
    const { props } = usePage<Props>();
    const { product } = props;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const allImages = product.thumbnail
        ? [product.thumbnail, ...product.images.map((img) => img.image)]
        : product.images.map((img) => img.image);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const handleDelete = () => {
        router.delete(products.destroy({ product: product.id }), {
            onSuccess: () => {
                setIsDialogOpen(false);
                router.get(products.index());
            },
        });
    };

    return (
        <>
            <Head title={product.name} />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={products.index()}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{product.name}</h1>
                            <p className="text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={editProductRoute({ product: product.id })}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setIsDialogOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border bg-card p-6">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                            {allImages.length > 0 ? (
                                <>
                                    <img
                                        src={storageUrl(allImages[currentImageIndex])}
                                        alt={`Product ${currentImageIndex + 1}`}
                                        className="h-full w-full object-contain"
                                    />
                                    {allImages.length > 1 && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="absolute left-2 top-1/2 -translate-y-1/2"
                                                onClick={prevImage}
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                                onClick={nextImage}
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <Package className="h-24 w-24 text-gray-400" />
                                </div>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                {allImages.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                                            index === currentImageIndex ? 'border-primary' : 'border-transparent'
                                        }`}
                                    >
                                        <img
                                            src={storageUrl(image)}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl border bg-card p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Product Details</h2>
                                <span
                                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                                        product.status === 'active'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                    }`}
                                >
                                    {product.status}
                                </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Category</p>
                                    <p className="font-medium">{product.category?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Brand</p>
                                    <p className="font-medium">{product.brand?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Stock</p>
                                    <p className={`font-medium ${product.stock === 0 ? 'text-red-500' : ''}`}>
                                        {product.stock} units
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Views</p>
                                    <p className="font-medium">{product.views}</p>
                                </div>
                            </div>

                            {product.short_description && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Short Description</p>
                                    <p>{product.short_description}</p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border bg-card p-6 space-y-4">
                            <h2 className="text-lg font-semibold">Pricing</h2>
                            <div className="flex items-baseline gap-3">
                                {product.sale_price ? (
                                    <>
                                        <span className="text-3xl font-bold text-green-600">
                                            {formatCurrency(product.sale_price)}
                                        </span>
                                        <span className="text-xl text-muted-foreground line-through">
                                            {formatCurrency(product.price)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
                                )}
                            </div>
                            {product.warranty && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">Warranty:</span>
                                    <span>{product.warranty}</span>
                                </div>
                            )}
                            {product.weight && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">Weight:</span>
                                    <span>{product.weight} kg</span>
                                </div>
                            )}
                        </div>

                        {product.specifications.length > 0 && (
                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Specifications</h2>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {product.specifications.map((spec) => (
                                        <div key={spec.id} className="flex justify-between">
                                            <span className="text-muted-foreground">{spec.spec_key}</span>
                                            <span className="font-medium">{spec.spec_value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.description && (
                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Description</h2>
                                <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.description }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
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

ShowProduct.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Products', href: '/admin/products' },
        { title: 'Product Details', href: '' },
    ],
};