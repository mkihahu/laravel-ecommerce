import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    Star,
    ArrowRight,
    Truck,
    Shield,
    RefreshCw,
    Phone,
    Eye,
    Sparkles,
    Gift,
    Heart,
} from 'lucide-react';
import { storageUrl } from '@/lib/utils';
import LandingNavigation from '@/components/landing-navigation';
import LandingFooter from '@/components/landing-footer';

interface NavCategory {
    id: number;
    name: string;
    slug: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    count: number;
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
    hoverImage?: string | null;
    badge?: string;
    discount?: number | null;
}

interface Testimonial {
    id: number;
    name: string;
    role: string;
    avatar: string | null;
    rating: number;
    text: string;
}

interface WelcomeProps {
    canRegister?: boolean;
    navCategories: NavCategory[];
    categories: Category[];
    newArrivals: Product[];
    bestSellers: Product[];
    testimonials: Testimonial[];
}

function useCountdown(targetDate: Date) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return timeLeft;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                        star <= rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200'
                    }`}
                />
            ))}
        </div>
    );
}

export default function Welcome({
    canRegister = true,
    navCategories = [],
    categories = [],
    newArrivals = [],
    bestSellers = [],
    testimonials = [],
}: WelcomeProps) {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    const countdownDate = new Date();
    countdownDate.setDate(countdownDate.getDate() + 3);
    const timeLeft = useCountdown(countdownDate);

    useEffect(() => {
        if (testimonials.length === 0) return;
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <>
            <Head title="Luxe Market - Premium Fashion & Lifestyle" />
            <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A]">
                {/* Announcement Bar */}
                <div className="bg-[#1A1A1A] text-white text-center py-2.5 text-xs font-medium tracking-wide">
                    <span className="inline-flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        Free shipping on orders over $150 | Use code GizmoGrid20 for 20% off
                        <Sparkles className="h-3 w-3" />
                    </span>
                </div>

                <LandingNavigation canRegister={canRegister} categories={navCategories} />

                {/* Hero Section - Futuristic Tech Commerce */}
                <section className="relative overflow-hidden bg-[#0A0A0A]">
                    {/* Background effects */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
                    </div>
                    
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-32">
                        <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8">
                                <Sparkles className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-medium text-blue-300">Next-Gen Technology 2026</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[0.9]">
                                The Future of
                                <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                                    Technology
                                </span>
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                Discover the latest in electronic innovation — from smart devices to powerful gadgets designed to make life easier.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 mt-10">
                                <Link
                                    href="/collections/all-product?sort=newest"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 hover:shadow-lg hover:shadow-white/20 hover:-translate-y-0.5"
                                >
                                    Shop Now
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
                                >
                                    Explore Collection
                                </Link>
                            </div>
                        </div>
                        
                        {/* Hero Product Showcase */}
                        <div className="relative max-w-5xl mx-auto">
                            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-gradient-to-b from-gray-900 to-black border border-white/10">
                                <img
                                    src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&h=675&fit=crop"
                                    alt="Premium electronics"
                                    className="w-full h-full object-cover opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div>
                                            <p className="text-white/60 text-sm">Starting from</p>
                                            <p className="text-3xl sm:text-4xl font-bold text-white">$299</p>
                                        </div>
                                        <div className="h-12 w-px bg-white/20" />
                                        <div>
                                            <p className="text-white/60 text-sm">Latest Models</p>
                                            <p className="text-xl font-semibold text-white">2026 Collection</p>
                                        </div>
                                        <div className="h-12 w-px bg-white/20" />
                                        <div>
                                            <p className="text-white/60 text-sm">Warranty</p>
                                            <p className="text-xl font-semibold text-white">2 Years</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Floating cards */}
                            <div className="absolute -top-4 -right-4 sm:-right-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Authentic</p>
                                        <p className="text-xs text-gray-400">100% Genuine</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -left-4 sm:-left-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Free Delivery</p>
                                        <p className="text-xs text-gray-400">Orders $100+</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 pt-8 border-t border-white/10">
                            <div className="text-center">
                                <p className="text-3xl sm:text-4xl font-bold text-white">50K+</p>
                                <p className="text-sm text-gray-500 mt-1">Happy Customers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl sm:text-4xl font-bold text-white">2K+</p>
                                <p className="text-sm text-gray-500 mt-1">Premium Products</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl sm:text-4xl font-bold text-white">4.9</p>
                                <p className="text-sm text-gray-500 mt-1">Average Rating</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Bar */}
                <section className="border-y border-gray-100 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: Truck, title: 'Free Shipping', desc: 'On orders over $150' },
                                { icon: Shield, title: 'Secure Payment', desc: '100% protected checkout' },
                                { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
                                { icon: Phone, title: '24/7 Support', desc: 'Dedicated assistance' },
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                                        <feature.icon className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{feature.title}</p>
                                        <p className="text-xs text-gray-500">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Shop By Category */}
                <section className="py-16 lg:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <span className="text-sm font-medium text-orange-500 uppercase tracking-wider">Browse</span>
                            <h2 className="text-3xl lg:text-4xl font-bold mt-2">Shop By Category</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/collections/${category.slug}`}
                                    className="group relative aspect-square rounded-2xl overflow-hidden"
                                >
                                    <img
                                        src={storageUrl(category.image) || '/images/placeholder-category.jpg'}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                        <p className="font-semibold text-sm lg:text-base">{category.name}</p>
                                        <p className="text-xs text-white/70">{category.count} items</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* New Arrivals */}
                <section className="py-16 lg:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <span className="text-sm font-medium text-orange-500 uppercase tracking-wider">Just In</span>
                                <h2 className="text-3xl lg:text-4xl font-bold mt-2">New Arrivals</h2>
                            </div>
                            <Link href="/collections/all-product?sort=newest" className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-600">
                                View All <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                            {newArrivals.map((product) => (
                                <div
                                    key={product.id}
                                    className="group"
                                    onMouseEnter={() => setHoveredProduct(product.id)}
                                    onMouseLeave={() => setHoveredProduct(null)}
                                >
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                                        <img
                                            src={storageUrl(hoveredProduct === product.id && product.hoverImage ? product.hoverImage : product.image) || '/images/placeholder-product.jpg'}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {product.badge && (
                                            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
                                                product.badge === 'Sale' ? 'bg-red-500 text-white' : 'bg-[#1A1A1A] text-white'
                                            }`}>
                                                {product.badge}
                                            </span>
                                        )}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="h-9 w-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-500 hover:text-white transition-colors">
                                                <Heart className="h-4 w-4" />
                                            </button>
                                            <button className="h-9 w-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-500 hover:text-white transition-colors">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <button className="absolute bottom-3 left-3 right-3 py-3 bg-white/90 backdrop-blur-sm rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-orange-500 hover:text-white">
                                            Add to Cart
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        <Link href={`/shop/${product.slug}`} className="block">
                                            <h3 className="font-medium text-sm lg:text-base group-hover:text-orange-500 transition-colors">{product.name}</h3>
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            <StarRating rating={Math.round(product.rating)} />
                                            <span className="text-xs text-gray-500">({product.reviews})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {product.salePrice ? (
                                                <>
                                                    <span className="font-semibold text-orange-500">${product.salePrice.toFixed(2)}</span>
                                                    <span className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</span>
                                                </>
                                            ) : (
                                                <span className="font-semibold">${product.price.toFixed(2)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="sm:hidden mt-8 text-center">
                            <Link href="/collections/all-product?sort=newest" className="inline-flex items-center gap-2 text-sm font-medium text-orange-500">
                                View All <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Special Offers */}
                <section className="py-16 lg:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1A1A1A] to-gray-800">
                            <div className="grid lg:grid-cols-2 gap-8 items-center">
                                <div className="p-8 lg:p-16 text-white">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-6">
                                        <Gift className="h-4 w-4" />
                                        Special Offers
                                    </span>
                                    <h2 className="text-3xl lg:text-5xl font-bold mb-4">
                                        Premium Audio<br />
                                        <span className="text-orange-400">Up to 40% Off</span>
                                    </h2>
                                    <p className="text-gray-300 mb-8 max-w-md">
                                        Experience crystal-clear sound with our curated collection of premium headphones and earbuds from top brands.
                                    </p>
                                    <div className="flex gap-4 mb-8">
                                        {[
                                            { label: 'Days', value: timeLeft.days },
                                            { label: 'Hours', value: timeLeft.hours },
                                            { label: 'Min', value: timeLeft.minutes },
                                            { label: 'Sec', value: timeLeft.seconds },
                                        ].map((item) => (
                                            <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center min-w-[70px]">
                                                <p className="text-2xl font-bold">{item.value}</p>
                                                <p className="text-xs text-gray-400">{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
                                    >
                                        Shop Audio Deals
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                                <div className="hidden lg:block relative h-full min-h-[400px]">
                                    <img
                                        src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&h=600&fit=crop"
                                        alt="Apple AirPods"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] to-transparent" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Best Sellers */}
                <section className="py-16 lg:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <span className="text-sm font-medium text-orange-500 uppercase tracking-wider">Popular</span>
                                <h2 className="text-3xl lg:text-4xl font-bold mt-2">Best Sellers</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {bestSellers.map((product) => (
                                <div key={product.id} className="group">
                                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                                        <img
                                            src={storageUrl(product.image) || '/images/placeholder-product.jpg'}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {product.discount && (
                                            <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                                                -{product.discount}%
                                            </span>
                                        )}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="h-9 w-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-500 hover:text-white transition-colors">
                                                <Heart className="h-4 w-4" />
                                            </button>
                                            <button className="h-9 w-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-500 hover:text-white transition-colors">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <button className="absolute bottom-3 left-3 right-3 py-3 bg-white/90 backdrop-blur-sm rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-orange-500 hover:text-white">
                                            Add to Cart
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        <Link href={`/shop/${product.slug}`} className="block">
                                            <h3 className="font-medium text-sm lg:text-base group-hover:text-orange-500 transition-colors">{product.name}</h3>
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            <StarRating rating={Math.round(product.rating)} />
                                            <span className="text-xs text-gray-500">({product.reviews})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {product.salePrice ? (
                                                <>
                                                    <span className="font-semibold text-orange-500">${product.salePrice.toFixed(2)}</span>
                                                    <span className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</span>
                                                </>
                                            ) : (
                                                <span className="font-semibold">${product.price.toFixed(2)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link
                                href="/collections/all-product"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A1A1A] text-white rounded-full font-medium hover:bg-orange-500 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
                            >
                                Shop All Products
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-16 lg:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <span className="text-sm font-medium text-orange-500 uppercase tracking-wider">Testimonials</span>
                            <h2 className="text-3xl lg:text-4xl font-bold mt-2">Our Happy Shoppers</h2>
                        </div>
                        <div className="max-w-3xl mx-auto">
                            <div className="relative bg-[#FAF8F5] rounded-3xl p-8 lg:p-12">
                                <div className="text-center">
                                    <img
                                        src={testimonials[currentTestimonial].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonials[currentTestimonial].name)}&size=100`}
                                        alt={testimonials[currentTestimonial].name}
                                        className="h-16 w-16 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
                                    />
                                    <div className="flex justify-center mb-4">
                                        <StarRating rating={testimonials[currentTestimonial].rating} />
                                    </div>
                                    <p className="text-lg lg:text-xl text-gray-600 italic leading-relaxed mb-6">
                                        "{testimonials[currentTestimonial].text}"
                                    </p>
                                    <p className="font-semibold">{testimonials[currentTestimonial].name}</p>
                                    <p className="text-sm text-gray-500">{testimonials[currentTestimonial].role}</p>
                                </div>
                                <div className="flex justify-center gap-2 mt-8">
                                    {testimonials.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentTestimonial(i)}
                                            className={`h-2 rounded-full transition-all ${
                                                i === currentTestimonial ? 'w-8 bg-orange-500' : 'w-2 bg-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter */}
                <section className="py-16 lg:py-24 bg-[#1A1A1A] text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Stay in the Loop</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Subscribe to our newsletter for exclusive offers, new arrivals, and style inspiration.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                            />
                            <button
                                type="submit"
                                className="px-8 py-4 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </section>

                <LandingFooter />
            </div>
        </>
    );
}
