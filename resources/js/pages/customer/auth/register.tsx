import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { User, Mail, Lock, ArrowRight, Truck, Shield, Gift, Sparkles } from 'lucide-react';
import LandingNavigation from '@/components/landing-navigation';
import LandingFooter from '@/components/landing-footer';

interface NavCategory {
    id: number;
    name: string;
    slug: string;
}

type Props = {
    canRegister: boolean;
    navCategories: NavCategory[];
};

const perks = [
    { icon: Truck, title: 'Free Shipping', desc: 'On your first order' },
    { icon: Shield, title: 'Secure Account', desc: 'Your data is protected' },
    { icon: Gift, title: 'Exclusive Deals', desc: 'Members-only discounts' },
];

export default function CustomerRegister({ canRegister, navCategories }: Props) {
    return (
        <>
            <Head title="Create Account - GizmoGrid" />

            <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A]">
                <LandingNavigation canRegister={canRegister} categories={navCategories} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Register Form */}
                        <div className="order-2 lg:order-1">
                            <div className="max-w-md mx-auto lg:mx-0">
                                <div className="mb-8">
                                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Create an account</h1>
                                    <p className="text-gray-600">Join GizmoGrid for a better shopping experience</p>
                                </div>

                                <Form
                                    method="post"
                                    action="/register"
                                    resetOnSuccess={['password', 'password_confirmation']}
                                    disableWhileProcessing
                                    className="space-y-5"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full name</Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            id="name"
                                                            type="text"
                                                            required
                                                            autoFocus
                                                            autoComplete="name"
                                                            name="name"
                                                            placeholder="John Doe"
                                                            className="pl-10 h-12 rounded-xl border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500/20"
                                                        />
                                                    </div>
                                                    <InputError message={errors.name} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            required
                                                            autoComplete="email"
                                                            name="email"
                                                            placeholder="email@example.com"
                                                            className="pl-10 h-12 rounded-xl border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500/20"
                                                        />
                                                    </div>
                                                    <InputError message={errors.email} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <PasswordInput
                                                            id="password"
                                                            required
                                                            autoComplete="new-password"
                                                            name="password"
                                                            placeholder="Create a strong password"
                                                            className="pl-10 h-12 rounded-xl border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500/20"
                                                        />
                                                    </div>
                                                    <InputError message={errors.password} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">Confirm password</Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <PasswordInput
                                                            id="password_confirmation"
                                                            required
                                                            autoComplete="new-password"
                                                            name="password_confirmation"
                                                            placeholder="Confirm your password"
                                                            className="pl-10 h-12 rounded-xl border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500/20"
                                                        />
                                                    </div>
                                                    <InputError message={errors.password_confirmation} />
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-lg shadow-orange-500/25 transition-all duration-300"
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <Spinner />
                                                ) : (
                                                    <>
                                                        Create account
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </>
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </Form>

                                <div className="mt-6 text-center text-sm text-gray-500">
                                    Already have an account?{' '}
                                    <Link href="/customer/login" className="text-orange-500 hover:text-orange-600 font-semibold">
                                        Sign in
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Perks Panel */}
                        <div className="order-1 lg:order-2 hidden lg:block">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl" />
                                <div className="absolute inset-0 opacity-10" style={{
                                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                                    backgroundSize: '40px 40px'
                                }} />

                                <div className="relative z-10 p-12 text-white">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
                                        <Sparkles className="h-4 w-4" />
                                        <span className="text-sm font-medium">Member benefits</span>
                                    </div>

                                    <h2 className="text-4xl font-bold leading-tight mb-4">
                                        Unlock exclusive<br />
                                        <span className="text-orange-100">rewards today</span>
                                    </h2>
                                    <p className="text-lg text-orange-100/80 mb-10">
                                        Create a free account and start enjoying premium benefits right away.
                                    </p>

                                    <div className="space-y-4">
                                        {perks.map((perk, index) => {
                                            const Icon = perk.icon;
                                            return (
                                                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                                    <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{perk.title}</p>
                                                        <p className="text-sm text-orange-100/70">{perk.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <LandingFooter />
            </div>
        </>
    );
}
