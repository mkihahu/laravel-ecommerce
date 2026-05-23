import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    ChevronRight,
    SlidersHorizontal,
    X,
    Grid3x3,
    List,
    ArrowUpDown,
    Star,
    Check,
    Search,
} from 'lucide-react';
import { storageUrl } from '@/lib/utils';
import LandingNavigation from '@/components/landing-navigation';
import LandingFooter from '@/components/landing-footer';
import ProductCard from '@/components/ProductCard';
import { FilterSection, PriceRangeSlider } from '@/components/FilterSidebar';

interface NavCategory {
    id: number;
    name: string;
    slug: string;
}

interface Category {
    id: number | null;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    rating: number;
    reviews: number;
    image: string | null;
    hoverImage: string | null;
    discount: number | null;
    category: { id: number; name: string; slug: string } | null;
    brand: { id: number; name: string; slug: string } | null;
    stock: number;
}

interface Brand {
    id: number;
    name: string;
    slug: string;
    count: number;
}

interface SubCategory {
    id: number;
    name: string;
    slug: string;
    count: number;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface CollectionProps {
    canRegister: boolean;
    navCategories: NavCategory[];
    category: Category;
    products: PaginatedProducts;
    brands: Brand[];
    subCategories: SubCategory[];
    allCategories: NavCategory[];
}

export default function CollectionShow(props: CollectionProps) {
    const { navCategories, category, products, brands, subCategories, allCategories } = props;
    const { url } = usePage();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const search = urlParams.get('search');
        const brandsParam = urlParams.get('brands');
        const categoriesParam = urlParams.get('categories');
        const ratingsParam = urlParams.get('ratings');
        const sort = urlParams.get('sort');
        const minPrice = urlParams.get('min_price');
        const maxPrice = urlParams.get('max_price');

        if (search) setSearchQuery(search);
        if (brandsParam) setSelectedBrands(brandsParam.split(','));
        if (categoriesParam) setSelectedCategories(categoriesParam.split(','));
        if (ratingsParam) setSelectedRatings(ratingsParam.split(',').map(Number));
        if (sort) setSortBy(sort);
        if (minPrice || maxPrice) {
            setPriceRange([Number(minPrice) || 0, Number(maxPrice) || 5000]);
        }
    }, []);

    const handleBrandToggle = (brandSlug: string) => {
        setSelectedBrands((prev) =>
            prev.includes(brandSlug) ? prev.filter((s) => s !== brandSlug) : [...prev, brandSlug]
        );
    };

    const handleRatingToggle = (rating: number) => {
        setSelectedRatings((prev) =>
            prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
        );
    };

    const handleCategoryToggle = (categorySlug: string) => {
        setSelectedCategories((prev) =>
            prev.includes(categorySlug) ? prev.filter((s) => s !== categorySlug) : [...prev, categorySlug]
        );
    };

    const clearFilters = () => {
        setSelectedBrands([]);
        setSelectedRatings([]);
        setSelectedCategories([]);
        setPriceRange([0, 5000]);
        setSortBy('newest');
        setSearchQuery('');
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (sortBy) params.set('sort', sortBy);
        if (priceRange[0] > 0) params.set('min_price', String(priceRange[0]));
        if (priceRange[1] < 5000) params.set('max_price', String(priceRange[1]));
        if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
        if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
        if (selectedRatings.length > 0) params.set('ratings', selectedRatings.join(','));

        router.get(`/collections/${category.slug}?${params.toString()}`, {}, { preserveState: true });
    };

    useEffect(() => {
        applyFilters();
    }, [sortBy, priceRange, selectedBrands, selectedRatings, selectedCategories, searchQuery]);

    const hasActiveFilters =
        selectedBrands.length > 0 ||
        selectedRatings.length > 0 ||
        selectedCategories.length > 0 ||
        priceRange[0] > 0 ||
        priceRange[1] < 5000;

    const displayCategories = category.id === null ? allCategories : subCategories;

    return (
        <>
            <Head title={`${category.name} - GizmoGrid`} />

            <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A]"> 
                <LandingNavigation canRegister={true} categories={navCategories} />

                {/* Hero Breadcrumb Section */}
                <section className="relative h-[350px] lg:h-[400px] overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${storageUrl(category.image) || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&h=600&fit=crop'})`,
                            filter: 'brightness(0.4) blur(2px)',
                            transform: 'scale(1.05)',
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

                    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
                        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                            {category.name}
                        </h1>
                        {category.description && (
                            <p className="text-lg text-gray-300 max-w-2xl mb-6">
                                {category.description}
                            </p>
                        )}

                        <nav className="flex items-center gap-2 text-sm text-gray-400">
                            <Link href="/" className="hover:text-white transition-colors">
                                Home
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <Link href="/" className="hover:text-white transition-colors">
                                Collections
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-white font-medium">{category.name}</span>
                        </nav>
                    </div>
                </section>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="flex gap-8">
                        {/* Mobile Filter Toggle */}
                        <button
                            className="lg:hidden fixed bottom-6 left-6 z-40 h-14 w-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <SlidersHorizontal className="h-6 w-6" />
                        </button>

                        {/* Sidebar Filters */}
                        <aside className="hidden lg:block w-72 flex-shrink-0">
                            <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900">Filters</h3>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                                        >
                                            <X className="h-3 w-3" />
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                <div className="px-4">
                                    {displayCategories.length > 0 && (
                                        <FilterSection title="Categories">
                                            <div className="space-y-2">
                                                {displayCategories.map((cat) => (
                                                    <label
                                                        key={cat.slug}
                                                        className="flex items-center justify-between cursor-pointer group"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                                                    selectedCategories.includes(cat.slug)
                                                                        ? 'bg-orange-500 border-orange-500'
                                                                        : 'border-gray-300 group-hover:border-orange-500'
                                                                }`}
                                                            >
                                                                {selectedCategories.includes(cat.slug) && (
                                                                    <Check className="h-3 w-3 text-white" />
                                                                )}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only"
                                                                checked={selectedCategories.includes(cat.slug)}
                                                                onChange={() => handleCategoryToggle(cat.slug)}
                                                            />
                                                            <span className="text-sm text-gray-700 group-hover:text-orange-500 transition-colors">
                                                                {cat.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">{'count' in cat ? cat.count : ''}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </FilterSection>
                                    )}

                                    <FilterSection title="Price Range">
                                        <PriceRangeSlider
                                            min={0}
                                            max={5000}
                                            value={priceRange}
                                            onChange={setPriceRange}
                                        />
                                    </FilterSection>

                                    <FilterSection title="Brands">
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {brands.map((brand) => (
                                                <label
                                                    key={brand.slug}
                                                    className="flex items-center justify-between cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                                                selectedBrands.includes(brand.slug)
                                                                    ? 'bg-orange-500 border-orange-500'
                                                                    : 'border-gray-300 group-hover:border-orange-500'
                                                            }`}
                                                        >
                                                            {selectedBrands.includes(brand.slug) && (
                                                                <Check className="h-3 w-3 text-white" />
                                                            )}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only"
                                                            checked={selectedBrands.includes(brand.slug)}
                                                            onChange={() => handleBrandToggle(brand.slug)}
                                                        />
                                                        <span className="text-sm text-gray-700 group-hover:text-orange-500 transition-colors">
                                                            {brand.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-400">{brand.count}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="Rating">
                                        <div className="space-y-2">
                                            {[5, 4, 3, 2, 1].map((rating) => (
                                                <label
                                                    key={rating}
                                                    className="flex items-center gap-2 cursor-pointer group"
                                                >
                                                    <div
                                                        className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                                            selectedRatings.includes(rating)
                                                                ? 'bg-orange-500 border-orange-500'
                                                                : 'border-gray-300 group-hover:border-orange-500'
                                                        }`}
                                                    >
                                                        {selectedRatings.includes(rating) && (
                                                            <Check className="h-3 w-3 text-white" />
                                                        )}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={selectedRatings.includes(rating)}
                                                        onChange={() => handleRatingToggle(rating)}
                                                    />
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`h-3.5 w-3.5 ${
                                                                    star <= rating
                                                                        ? 'fill-orange-400 text-orange-400'
                                                                        : 'text-gray-200'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-500">& up</span>
                                                </label>
                                            ))}
                                        </div>
                                    </FilterSection>
                                </div>
                            </div>
                        </aside>

                        {/* Mobile Sidebar */}
                        {sidebarOpen && (
                            <div className="fixed inset-0 z-50 lg:hidden">
                                <div
                                    className="absolute inset-0 bg-black/50"
                                    onClick={() => setSidebarOpen(false)}
                                />
                                <div className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">Filters</h3>
                                        <button
                                            onClick={() => setSidebarOpen(false)}
                                            className="p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-gray-500">Mobile filters coming soon...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Product Grid Area */}
                        <div className="flex-1 min-w-0">
                            {/* Top Toolbar */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm text-gray-600">
                                            Showing <span className="font-semibold text-gray-900">{products.from ?? 0}</span>–
                                            <span className="font-semibold text-gray-900">{products.to ?? 0}</span> of{' '}
                                            <span className="font-semibold text-gray-900">{products.total}</span> products
                                        </p>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                                            >
                                                <X className="h-3 w-3" />
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Search Input */}
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                applyFilters();
                                            }}
                                            className="relative"
                                        >
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search products..."
                                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-48"
                                            />
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </form>

                                        <div className="relative">
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                            >
                                                <option value="newest">Newest First</option>
                                                <option value="price-low">Price: Low to High</option>
                                                <option value="price-high">Price: High to Low</option>
                                                <option value="rating">Highest Rated</option>
                                                <option value="popular">Most Popular</option>
                                            </select>
                                            <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>

                                        <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-2 transition-colors ${
                                                    viewMode === 'grid'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-white text-gray-400 hover:text-gray-600'
                                                }`}
                                            >
                                                <Grid3x3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-2 transition-colors ${
                                                    viewMode === 'list'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-white text-gray-400 hover:text-gray-600'
                                                }`}
                                            >
                                                <List className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            {products.data.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                    <p className="text-lg text-gray-500 mb-4">No products found</p>
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className={
                                            viewMode === 'grid'
                                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                                                : 'space-y-4'
                                        }
                                    >
                                        {products.data.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {products.last_page > 1 && (
                                        <div className="mt-12 flex items-center justify-center gap-2">
                                            {products.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url ?? '#'}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        link.active
                                                            ? 'bg-orange-500 text-white'
                                                            : link.url
                                                            ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                            : 'text-gray-300 cursor-not-allowed'
                                                    }`}
                                                    preserveState
                                                >
                                                    {link.label === '&laquo; Previous'
                                                        ? 'Prev'
                                                        : link.label === 'Next &raquo;'
                                                        ? 'Next'
                                                        : link.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <LandingFooter />
            </div>
        </>
    );
}
