import { Head, usePage, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Plus,
    Search,
    Download,
    Edit,
    Eye,
    Trash2,
    Package,
    Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import products from '@/routes/admin/products';
import { create as createProductRoute } from '@/routes/admin/products';
import { storageUrl } from '@/lib/utils';

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price: number;
    sale_price: number | null;
    stock: number;
    thumbnail: string | null;
    status: string;
    featured: boolean;
    category: { id: number; name: string } | null;
    brand: { id: number; name: string } | null;
    images: Array<{ id: number; image: string }>;
}

interface Props {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    categories: Array<{ id: number; name: string }>;
    brands: Array<{ id: number; name: string }>;
    filters: {
        search: string;
        status: string;
        category: string;
        brand: string;
    };
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

export default function ProductsIndex() {
    const { props } = usePage<Props>();
    const { products, categories, brands, filters } = props;
    const [search, setSearch] = useState(filters.search);
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [brandFilter, setBrandFilter] = useState(filters.brand || 'all');
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

    const applyFilters = (overrides?: { search?: string; status?: string; category?: string; brand?: string }) => {
        const params = new URLSearchParams();
        const s = overrides?.search !== undefined ? overrides.search : search;
        const st = overrides?.status !== undefined ? overrides.status : statusFilter;
        const ca = overrides?.category !== undefined ? overrides.category : categoryFilter;
        const br = overrides?.brand !== undefined ? overrides.brand : brandFilter;
        if (s) params.set('search', s);
        if (st !== 'all') params.set('status', st);
        if (ca !== 'all') params.set('category', ca);
        if (br !== 'all') params.set('brand', br);
        const queryString = params.toString();
        router.get(`/admin/products${queryString ? '?' + queryString : ''}`, {}, { preserveState: true });
    };

    const handleSearch = () => {
        applyFilters();
    };

    const handleFilterChange = (key: string, value: string) => {
        const newStatus = key === 'status' ? value : statusFilter;
        const newCategory = key === 'category' ? value : categoryFilter;
        const newBrand = key === 'brand' ? value : brandFilter;
        if (key === 'status') setStatusFilter(value);
        if (key === 'category') setCategoryFilter(value);
        if (key === 'brand') setBrandFilter(value);
        applyFilters({ status: newStatus, category: newCategory, brand: newBrand });
    };

    const handleExport = (format: string) => {
        window.location.href = `/admin/products/export?format=${format}`;
    };

    const handleDelete = () => {
        if (deleteProduct) {
            router.delete(`/admin/products/${deleteProduct.id}`, {
                onSuccess: () => setDeleteProduct(null),
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        };
        return styles[status as keyof typeof styles] || styles.inactive;
    };

    return (
        <>
            <Head title="Products" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Products</h1>
                        <p className="text-muted-foreground">Manage your products inventory</p>
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleExport('csv')}>
                                    Export CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('json')}>
                                    Export JSON
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button asChild>
                            <Link href={createProductRoute()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground"
                                onClick={handleSearch}
                            />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="w-[150px]">
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => handleFilterChange('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[150px]">
                        <Select
                            value={categoryFilter}
                            onValueChange={(value) => handleFilterChange('category', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[150px]">
                        <Select
                            value={brandFilter}
                            onValueChange={(value) => handleFilterChange('brand', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Brand" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Brands</SelectItem>
                                {brands.map((brand) => (
                                    <SelectItem key={brand.id} value={brand.id.toString()}>
                                        {brand.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.data.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                                                {product.thumbnail ? (
                                                    <img
                                                        src={storageUrl(product.thumbnail)}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <Package className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {product.featured && (
                                                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                        Featured
                                                    </span>
                                                )}
                                                {product.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell>{product.category?.name || '-'}</TableCell>
                                        <TableCell>{product.brand?.name || '-'}</TableCell>
                                        <TableCell>
                                            {product.sale_price ? (
                                                <div>
                                                    <span className="font-medium">{formatCurrency(product.sale_price)}</span>
                                                    <span className="ml-2 text-sm text-muted-foreground line-through">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                </div>
                                            ) : (
                                                formatCurrency(product.price)
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={product.stock === 0 ? 'text-red-500' : ''}>
                                                {product.stock}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(product.status)}`}>
                                                {product.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/products/${product.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/products/${product.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeleteProduct(product)}
                                                >
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

                {products.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {products.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteProduct?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteProduct(null)}>
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

ProductsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Products', href: '/admin/products' },
    ],
};