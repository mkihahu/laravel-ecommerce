import { Link } from '@inertiajs/react';
import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
} from 'lucide-react';

export default function LandingFooter() {
    return (
        <footer className="bg-[#141414] text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">G</span>
                            </div>
                            <span className="text-xl font-bold">GizmoGrid</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">
                            Premium fashion and lifestyle marketplace. Curated collections for the modern individual.
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                                <a key={i} href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-colors">
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Shop</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            {['New Arrivals', 'Women', 'Men', 'Accessories', 'Sale'].map((item) => (
                                <li key={item}><a href="#" className="hover:text-orange-500 transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            {['About Us', 'Careers', 'Press', 'Blog', 'Contact'].map((item) => (
                                <li key={item}><a href="#" className="hover:text-orange-500 transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            {['Help Center', 'Shipping Info', 'Returns', 'Size Guide', 'FAQ'].map((item) => (
                                <li key={item}><a href="#" className="hover:text-orange-500 transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">&copy; 2026 GizmoGrid Market. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">We accept:</span>
                        <div className="flex gap-2">
                            {['Visa', 'MC', 'Amex', 'PayPal'].map((card) => (
                                <span key={card} className="px-3 py-1 bg-white/10 rounded text-xs font-medium">{card}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
