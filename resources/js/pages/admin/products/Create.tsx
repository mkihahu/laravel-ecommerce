import { Head, usePage, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Plus, X, Upload, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import products from '@/routes/admin/products';
import { create as createProductRoute } from '@/routes/admin/products';

interface Category {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    name: string;
}

interface Props {
    categories: Array<{ id: number; name: string }>;
    brands: Array<{ id: number; name: string }>;
}

interface Specification {
    spec_key: string;
    spec_value: string;
}

export default function CreateProduct() {
    const { props } = usePage<Props>();
    const { categories, brands } = props;

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [specifications, setSpecifications] = useState<Specification[]>([
        { spec_key: '', spec_value: '' },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        brand_id: '',
        sku: '',
        short_description: '',
        description: '',
        price: '',
        sale_price: '',
        stock: '',
        weight: '',
        warranty: '',
        featured: false,
        status: 'active',
    });

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setImages((prev) => [...prev, ...files]);
            setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const addSpecification = () => {
        setSpecifications((prev) => [...prev, { spec_key: '', spec_value: '' }]);
    };

    const removeSpecification = (index: number) => {
        setSpecifications((prev) => prev.filter((_, i) => i !== index));
    };

    const updateSpecification = (index: number, field: keyof Specification, value: string) => {
        setSpecifications((prev) =>
            prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec))
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (typeof value === 'boolean') {
                data.append(key, value ? '1' : '0');
            } else if (key !== 'thumbnail' && value !== '') {
                data.append(key, value);
            }
        });

        if (thumbnailFile) {
            data.append('thumbnail', thumbnailFile);
        }

        images.forEach((image) => {
            data.append('images[]', image);
        });

        let specIndex = 0;
        specifications.forEach((spec) => {
            if (spec.spec_key && spec.spec_value) {
                data.append(`specifications[${specIndex}][spec_key]`, spec.spec_key);
                data.append(`specifications[${specIndex}][spec_value]`, spec.spec_value);
                specIndex++;
            }
        });

        router.post('/admin/products', data, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Add Product" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={products.index()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Add Product</h1>
                        <p className="text-muted-foreground">Create a new product</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Basic Information</h2>
                                
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Product Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU *</Label>
                                        <Input
                                            id="sku"
                                            value={formData.sku}
                                            onChange={(e) => handleInputChange('sku', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Category *</Label>
                                        <Select
                                            value={formData.category_id}
                                            onValueChange={(value) => handleInputChange('category_id', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Brand *</Label>
                                        <Select
                                            value={formData.brand_id}
                                            onValueChange={(value) => handleInputChange('brand_id', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select brand" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {brands.map((brand) => (
                                                    <SelectItem key={brand.id} value={brand.id.toString()}>
                                                        {brand.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="short_description">Short Description</Label>
                                    <Input
                                        id="short_description"
                                        value={formData.short_description}
                                        onChange={(e) => handleInputChange('short_description', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <TiptapEditor
                                        value={formData.description}
                                        onChange={(value) => handleInputChange('description', value)}
                                        placeholder="Enter product description..."
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Pricing & Inventory</h2>
                                
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => handleInputChange('price', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sale_price">Sale Price</Label>
                                        <Input
                                            id="sale_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.sale_price}
                                            onChange={(e) => handleInputChange('sale_price', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Stock *</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            min="0"
                                            value={formData.stock}
                                            onChange={(e) => handleInputChange('stock', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="warranty">Warranty</Label>
                                        <Input
                                            id="warranty"
                                            value={formData.warranty}
                                            onChange={(e) => handleInputChange('warranty', e.target.value)}
                                            placeholder="e.g., 1 Year"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="weight">Weight (kg)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.weight}
                                        onChange={(e) => handleInputChange('weight', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">Specifications</h2>
                                    <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {specifications.map((spec, index) => (
                                        <div key={index} className="flex gap-3">
                                            <Input
                                                placeholder="Key (e.g., Display)"
                                                value={spec.spec_key}
                                                onChange={(e) => updateSpecification(index, 'spec_key', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Value (e.g., 6.8 inch)"
                                                value={spec.spec_value}
                                                onChange={(e) => updateSpecification(index, 'spec_value', e.target.value)}
                                            />
                                            {specifications.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeSpecification(index)}
                                                >
                                                    <X className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
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
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="featured"
                                        checked={formData.featured}
                                        onCheckedChange={(checked) => handleInputChange('featured', checked as boolean)}
                                    />
                                    <Label htmlFor="featured">Featured Product</Label>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Thumbnail</h2>
                                <div className="space-y-2">
                                    <Label>Product Thumbnail</Label>
                                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setThumbnailFile(file);
                                                    setThumbnailPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="hidden"
                                            id="thumbnail-upload"
                                        />
                                        {thumbnailPreview ? (
                                            <div className="relative">
                                                <img
                                                    src={thumbnailPreview}
                                                    alt="Thumbnail preview"
                                                    className="w-full h-40 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setThumbnailFile(null);
                                                        setThumbnailPreview(null);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label htmlFor="thumbnail-upload" className="cursor-pointer">
                                                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    Click to upload thumbnail
                                                </p>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card p-6 space-y-4">
                                <h2 className="text-lg font-semibold">Gallery Images</h2>
                                <div className="space-y-2">
                                    <Label>Product Images</Label>
                                    <div className="border-2 border-dashed rounded-lg p-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="images-upload"
                                        />
                                        <label htmlFor="images-upload" className="cursor-pointer">
                                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                Click to upload images
                                            </p>
                                        </label>
                                    </div>
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mt-4">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative aspect-square">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Product'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

CreateProduct.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Products', href: '/admin/products' },
        { title: 'Add Product', href: '/admin/products/create' },
    ],
};