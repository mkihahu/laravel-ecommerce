import { Head, Link } from '@inertiajs/react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ChevronRight } from 'lucide-react';
import LandingNavigation from '@/components/landing-navigation';
import LandingFooter from '@/components/landing-footer';

interface NavCategory {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    navCategories: NavCategory[];
}

export default function Contact({ navCategories }: Props) {
    return (
        <>
            <Head title="Contact Us - GizmoGrid" />

            <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A]">
                <LandingNavigation canRegister={true} categories={navCategories} />

                <section className="relative bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
                        <div className="text-center max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm mb-6">
                                <MessageSquare className="h-4 w-4" />
                                Get in Touch
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Contact Us</h1>
                            <p className="text-lg text-orange-100 leading-relaxed">
                                Have a question, feedback, or need assistance? We're here to help.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                    <div className="grid lg:grid-cols-3 gap-6 mb-16">
                        {[
                            { icon: Mail, title: 'Email Us', text: 'support@gizmogrid.com', sub: 'We reply within 24 hours' },
                            { icon: Phone, title: 'Call Us', text: '+1 (555) 123-4567', sub: 'Mon-Fri 9AM-6PM EST' },
                            { icon: MapPin, title: 'Visit Us', text: '123 Tech Street', sub: 'San Francisco, CA 94105' },
                        ].map((item) => (
                            <div key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="h-6 w-6 text-orange-500" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-orange-500 font-medium">{item.text}</p>
                                <p className="text-sm text-gray-500 mt-1">{item.sub}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                    <div className="grid lg:grid-cols-5 gap-10">
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a message</h2>
                                <p className="text-gray-500 mb-8">Fill out the form and we'll get back to you shortly.</p>
                                <form className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                                            <input
                                                type="text"
                                                placeholder="John"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                                            <input
                                                type="text"
                                                placeholder="Doe"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                                        <input
                                            type="text"
                                            placeholder="How can we help?"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                                        <textarea
                                            rows={5}
                                            placeholder="Tell us more about your inquiry..."
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 resize-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                                    >
                                        <Send className="h-4 w-4" />
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
                                        { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
                                        { day: 'Sunday', hours: 'Closed' },
                                    ].map((item) => (
                                        <div key={item.day} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                            <span className="text-sm text-gray-600">{item.day}</span>
                                            <span className={`text-sm font-medium ${item.hours === 'Closed' ? 'text-red-500' : 'text-gray-900'}`}>
                                                {item.hours}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                                <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'About Us', href: '/' },
                                        { label: 'FAQs', href: '/' },
                                        { label: 'Shipping & Returns', href: '/' },
                                        { label: 'Privacy Policy', href: '/' },
                                    ].map((link) => (
                                        <Link
                                            key={link.label}
                                            href={link.href}
                                            className="flex items-center justify-between py-2 text-sm text-gray-600 hover:text-orange-500 transition-colors group"
                                        >
                                            {link.label}
                                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <LandingFooter />
            </div>
        </>
    );
}
