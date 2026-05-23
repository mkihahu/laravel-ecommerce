import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Heart, Eye, ShoppingCart, Star } from 'lucide-react';
import { storageUrl } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';

interface ProductCardProps {
    product: {
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
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { auth } = usePage().props as { auth: { user: unknown } };

    const currentImage = isHovered && product.hoverImage
        ? product.hoverImage
        : product.image;

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
                    <button className="h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 delay-75 hover:bg-orange-500 hover:text-white">
                        <Eye className="h-4 w-4" />
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

                <Link
                    href={`/shop/${product.slug}`}
                    className="block"
                >
                    <h3 className="font-semibold text-sm lg:text-base text-gray-900 group-hover:text-orange-500 transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                    star <= Math.round(product.rating)
                                        ? 'fill-orange-400 text-orange-400'
                                        : 'text-gray-200'
                                }`}
                            />
                        ))}
                    </div>
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
