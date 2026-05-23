import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ChevronRight,
    Star,
    Heart,
    ShoppingCart,
    Minus,
    Plus,
    Share2,
    Facebook,
    Twitter,
    Link as LinkIcon,
    Truck,
    Shield,
    RefreshCw,
    ArrowLeftRight,
} from 'lucide-react';
import { storageUrl } from '@/lib/utils';
import LandingNavigation from '@/components/landing-navigation';
import LandingFooter from '@/components/landing-footer';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';

interface NavCategory {
    id: number;
    name: string;
    slug: string;
}

interface ProductImage {
    id: number;
    image: string;
}

interface Review {
    id: number;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface Specification {
    key: string;
    value: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    sku: string;
    short_description: string | null;
    description: string | null;
    price: number;
    salePrice: number | null;
    discount: number | null;
    rating: number;
    reviewCount: number;
    stock: number;
    weight: number | null;
    warranty: string | null;
    images: string[];
    thumbnail: string | null;
    category: { id: number; name: string; slug: string } | null;
    brand: { id: number; name: string; slug: string } | null;
    specifications: Specification[];
    reviews: Review[];
}

interface RelatedProduct {
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

interface ShopShowProps {
    canRegister: boolean;
    canReview: boolean;
    navCategories: NavCategory[];
    product: Product;
    relatedProducts: RelatedProduct[];
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
    const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizeClass} ${
                        star <= Math.round(rating)
                            ? 'fill-orange-400 text-orange-400'
                            : 'text-gray-200'
                    }`}
                />
            ))}
        </div>
    );
}

export default function ShopShow({ canReview, navCategories, product, relatedProducts }: ShopShowProps) {
    const { auth } = usePage().props as any;
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'additional' | 'reviews'>('description');
    const [isZoomed, setIsZoomed] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const allImages = product.images.length > 0 ? product.images : [product.thumbnail];

    const inWishlist = isInWishlist(product.id);

    const handleAddToCart = async () => {
        if (!auth?.user) {
            toast.error('Please login to add items to cart');
            return;
        }
        await addToCart(product.id, quantity);
        toast.success(`Added ${quantity} item(s) to cart`);
    };

    const handleBuyNow = async () => {
        if (!auth?.user) {
            toast.error('Please login to proceed');
            return;
        }
        await handleAddToCart();
        router.visit('/cart');
    };

    const handleWishlistToggle = async () => {
        if (!auth?.user) {
            toast.error('Please login to add items to wishlist');
            return;
        }
        const added = await toggleWishlist(product.id);
        toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
    };

    const handleShare = (platform: string) => {
        const url = window.location.href;
        const text = `Check out ${product.name}`;
        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard');
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (reviewRating === 0) {
            toast.error('Please select a rating');
            return;
        }
        setSubmittingReview(true);
        router.post(`/shop/${product.slug}/review`, {
            rating: reviewRating,
            comment: reviewComment,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setReviewRating(0);
                setReviewComment('');
                setSubmittingReview(false);
                setActiveTab('reviews');
                toast.success('Review submitted! It will appear after approval.');
            },
            onError: () => {
                setSubmittingReview(false);
                toast.error('Failed to submit review.');
            },
        });
    };

    const decrementQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const incrementQuantity = () => {
        if (quantity < product.stock) setQuantity(quantity + 1);
    };

    return (
        <>
            <Head title={`${product.name} - GizmoGrid`} />

            <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A]">
                <LandingNavigation canRegister={true} categories={navCategories} />

                {/* Hero Breadcrumb Section */}
                <section className="relative h-[250px] lg:h-[350px] overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center scale-105"
                        style={{
                            backgroundImage: `url(${storageUrl(allImages[0]) || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&h=600&fit=crop'})`,
                            filter: 'brightness(0.4) blur(2px)',
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

                    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
                        <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                            {product.name}
                        </h1>

                        <nav className="flex items-center gap-2 text-sm text-gray-400">
                            <Link href="/" className="hover:text-white transition-colors">
                                Home
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            {product.category && (
                                <>
                                    <Link href={`/collections/${product.category.slug}`} className="hover:text-white transition-colors">
                                        {product.category.name}
                                    </Link>
                                    <ChevronRight className="h-4 w-4" />
                                </>
                            )}
                            <span className="text-white font-medium">{product.name}</span>
                        </nav>
                    </div>
                </section>

                {/* Product Showcase Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Product Gallery */}
                        <div className="flex gap-4">
                            {/* Thumbnail Gallery */}
                            {allImages.length > 1 && (
                                <div className="flex flex-col gap-3 order-2 lg:order-1">
                                    {allImages.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                                                selectedImage === index
                                                    ? 'border-orange-500 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={storageUrl(image) || '/images/placeholder-product.jpg'}
                                                alt={`${product.name} - ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main Image */}
                            <div className="flex-1 order-1 lg:order-2">
                                <div
                                    className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in"
                                    onMouseEnter={() => setIsZoomed(true)}
                                    onMouseLeave={() => setIsZoomed(false)}
                                >
                                    <img
                                        src={storageUrl(allImages[selectedImage]) || '/images/placeholder-product.jpg'}
                                        alt={product.name}
                                        className={`w-full h-full object-cover transition-transform duration-300 ${
                                            isZoomed ? 'scale-110' : 'scale-100'
                                        }`}
                                    />
                                    {product.discount && (
                                        <span className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold shadow-lg">
                                            -{product.discount}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Product Information */}
                        <div className="space-y-6">
                            {product.category && (
                                <Link
                                    href={`/collections/${product.category.slug}`}
                                    className="inline-block text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
                                >
                                    {product.category.name}
                                </Link>
                            )}

                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4">
                                <StarRating rating={product.rating} size="md" />
                                <span className="text-sm text-gray-500">
                                    {product.rating} ({product.reviewCount} reviews)
                                </span>
                            </div>

                            <div className="flex items-baseline gap-4">
                                {product.salePrice ? (
                                    <>
                                        <span className="text-4xl font-bold text-orange-500">
                                            ${product.salePrice.toFixed(2)}
                                        </span>
                                        <span className="text-xl text-gray-400 line-through">
                                            ${product.price.toFixed(2)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-4xl font-bold text-gray-900">
                                        ${product.price.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {product.short_description && (
                                <p className="text-gray-600 leading-relaxed">
                                    {product.short_description}
                                </p>
                            )}

                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                {/* Quantity Selector */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={decrementQuantity}
                                            disabled={quantity <= 1}
                                            className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="px-6 py-2 text-sm font-semibold min-w-[60px] text-center">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={incrementQuantity}
                                            disabled={quantity >= product.stock}
                                            className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {product.stock > 0 && (
                                        <span className="text-sm text-green-600 font-medium">
                                            {product.stock} in stock
                                        </span>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className="flex-1 py-4 px-8 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={product.stock === 0}
                                        className="py-4 px-8 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Buy Now
                                    </button>
                                </div>

                                {/* Wishlist & Compare */}
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handleWishlistToggle}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                            inWishlist ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'
                                        }`}
                                    >
                                        <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
                                        {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                                    </button>
                                    <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
                                        <ArrowLeftRight className="h-4 w-4" />
                                        Compare
                                    </button>
                                </div>

                                {/* SKU & Meta */}
                                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                                    <p>
                                        <span className="font-medium">SKU:</span> {product.sku}
                                    </p>
                                    {product.brand && (
                                        <p>
                                            <span className="font-medium">Brand:</span>{' '}
                                            <Link href={`/collections/${product.brand.slug}`} className="text-orange-500 hover:text-orange-600">
                                                {product.brand.name}
                                            </Link>
                                        </p>
                                    )}
                                    {product.warranty && (
                                        <p>
                                            <span className="font-medium">Warranty:</span> {product.warranty}
                                        </p>
                                    )}
                                </div>

                                {/* Social Sharing */}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                    <span className="text-sm font-medium text-gray-700">Share:</span>
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className="p-2 bg-gray-100 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                    >
                                        <Facebook className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className="p-2 bg-gray-100 rounded-full hover:bg-sky-100 hover:text-sky-500 transition-colors"
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('copy')}
                                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                        <LinkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <Truck className="h-6 w-6 text-orange-500" />
                                    <span className="text-xs text-gray-600">Free Shipping</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <Shield className="h-6 w-6 text-orange-500" />
                                    <span className="text-xs text-gray-600">Secure Payment</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <RefreshCw className="h-6 w-6 text-orange-500" />
                                    <span className="text-xs text-gray-600">Easy Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details Tabs */}
                    <div className="mt-16">
                        <div className="border-b border-gray-200">
                            <nav className="flex gap-8">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`pb-4 text-sm font-medium transition-colors relative ${
                                        activeTab === 'description'
                                            ? 'text-orange-500'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Description
                                    {activeTab === 'description' && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('additional')}
                                    className={`pb-4 text-sm font-medium transition-colors relative ${
                                        activeTab === 'additional'
                                            ? 'text-orange-500'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Additional Information
                                    {activeTab === 'additional' && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`pb-4 text-sm font-medium transition-colors relative ${
                                        activeTab === 'reviews'
                                            ? 'text-orange-500'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Reviews ({product.reviewCount})
                                    {activeTab === 'reviews' && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                                    )}
                                </button>
                            </nav>
                        </div>

                        <div className="py-8">
                            {activeTab === 'description' && (
                                <div className="prose max-w-none">
                                    {product.description ? (
                                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                                            {product.description}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No description available.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'additional' && (
                                <div className="overflow-hidden">
                                    <table className="w-full">
                                        <tbody className="divide-y divide-gray-200">
                                            <tr>
                                                <td className="py-3 text-sm font-medium text-gray-700 w-48">SKU</td>
                                                <td className="py-3 text-sm text-gray-600">{product.sku}</td>
                                            </tr>
                                            {product.brand && (
                                                <tr>
                                                    <td className="py-3 text-sm font-medium text-gray-700">Brand</td>
                                                    <td className="py-3 text-sm text-gray-600">{product.brand.name}</td>
                                                </tr>
                                            )}
                                            {product.weight && (
                                                <tr>
                                                    <td className="py-3 text-sm font-medium text-gray-700">Weight</td>
                                                    <td className="py-3 text-sm text-gray-600">{product.weight} kg</td>
                                                </tr>
                                            )}
                                            {product.warranty && (
                                                <tr>
                                                    <td className="py-3 text-sm font-medium text-gray-700">Warranty</td>
                                                    <td className="py-3 text-sm text-gray-600">{product.warranty}</td>
                                                </tr>
                                            )}
                                            {product.specifications.map((spec, index) => (
                                                <tr key={index}>
                                                    <td className="py-3 text-sm font-medium text-gray-700">{spec.key}</td>
                                                    <td className="py-3 text-sm text-gray-600">{spec.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-6">
                                    {canReview && (
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                            <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
                                            <form onSubmit={handleSubmitReview} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setReviewRating(star)}
                                                                className="p-0.5"
                                                            >
                                                                <Star
                                                                    className={`h-6 w-6 ${
                                                                        star <= reviewRating
                                                                            ? 'fill-orange-400 text-orange-400'
                                                                            : 'text-gray-300'
                                                                    } transition-colors`}
                                                                />
                                                            </button>
                                                        ))}
                                                        {reviewRating > 0 && (
                                                            <span className="text-sm text-gray-500 ml-2">
                                                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                                                    <textarea
                                                        value={reviewComment}
                                                        onChange={(e) => setReviewComment(e.target.value)}
                                                        placeholder="Share your experience with this product..."
                                                        rows={4}
                                                        maxLength={2000}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={submittingReview || reviewRating === 0}
                                                    className="px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                    {product.reviews.length > 0 ? (
                                        product.reviews.map((review) => (
                                            <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {review.user_name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{review.user_name}</p>
                                                            <p className="text-xs text-gray-500">{review.created_at}</p>
                                                        </div>
                                                    </div>
                                                    <StarRating rating={review.rating} size="sm" />
                                                </div>
                                                {review.comment && (
                                                    <p className="text-gray-600 mt-3 leading-relaxed">{review.comment}</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16 pt-16 border-t border-gray-200">
                            <h2 className="text-2xl lg:text-3xl font-bold mb-8">Related Products</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((related) => (
                                    <RelatedProductCard key={related.id} product={related} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <LandingFooter />
            </div>
        </>
    );
}

function RelatedProductCard({ product }: { product: RelatedProduct }) {
    const [isHovered, setIsHovered] = useState(false);
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { auth } = usePage().props as { auth: { user: unknown } };

    const currentImage = isHovered && product.hoverImage ? product.hoverImage : product.image;
    const inWishlist = isInWishlist(product.id);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!auth.user) {
            toast.error('Please login to add items to cart');
            return;
        }
        await addToCart(product.id);
        toast.success('Added to cart');
    };

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!auth.user) {
            toast.error('Please login to add items to wishlist');
            return;
        }
        const added = await toggleWishlist(product.id);
        toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
    };

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                    src={storageUrl(currentImage) || '/images/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {product.discount && (
                    <span className="absolute top-3 left-3 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold shadow-lg">
                        -{product.discount}%
                    </span>
                )}

                {product.stock === 0 && (
                    <span className="absolute top-3 left-3 px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-semibold">
                        Out of Stock
                    </span>
                )}

                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                        onClick={handleWishlistToggle}
                        className={`h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 hover:bg-orange-500 hover:text-white ${
                            inWishlist ? 'bg-orange-500 text-white opacity-100 translate-x-0' : ''
                        }`}
                    >
                        <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="absolute bottom-3 left-3 right-3 py-3 bg-white/95 backdrop-blur-sm rounded-xl text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-orange-500 hover:text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/95 disabled:hover:text-gray-900"
                >
                    <ShoppingCart className="h-4 w-4" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>

            <div className="p-4 space-y-3">
                {product.category && (
                    <Link
                        href={`/collections/${product.category.slug}`}
                        className="text-xs font-medium text-gray-500 hover:text-orange-500 transition-colors"
                    >
                        {product.category.name}
                    </Link>
                )}

                <Link href={`/shop/${product.slug}`} className="block">
                    <h3 className="font-semibold text-sm lg:text-base text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2">
                    <StarRating rating={product.rating} size="sm" />
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>

                <div className="flex items-center gap-2">
                    {product.salePrice ? (
                        <>
                            <span className="font-bold text-lg text-orange-500">${product.salePrice.toFixed(2)}</span>
                            <span className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</span>
                        </>
                    ) : (
                        <span className="font-bold text-lg text-gray-900">${product.price.toFixed(2)}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
