import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Mail, Lock, ArrowRight, CheckCircle2, Zap, Shield, Globe } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

const features = [
    { icon: Zap, text: 'Lightning-fast performance' },
    { icon: Shield, text: 'Enterprise-grade security' },
    { icon: Globe, text: 'Global reach, local feel' },
];

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
                {/* Left side - Login Form */}
                <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
                    <div className="w-full max-w-md space-y-8">
                        {/* Logo / Brand */}
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">YourBrand</span>
                        </div>

                        {/* Heading */}
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
                            <p className="text-gray-500">Enter your credentials to access your account</p>
                        </div>

                        {status && (
                            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-medium text-emerald-700">
                                {status}
                            </div>
                        )}

                        {/* Form */}
                        <Form
                            method="post"
                            action="/login"
                            resetOnSuccess={['password']}
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="email@example.com"
                                                    className="pl-10 h-12 rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                                                />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                                        tabIndex={5}
                                                    >
                                                        Forgot password?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <PasswordInput
                                                    id="password"
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="Enter your password"
                                                    className="pl-10 h-12 rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                                                />
                                            </div>
                                            <InputError message={errors.password} />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="rounded-md border-gray-200 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <Spinner />
                                        ) : (
                                            <>
                                                Sign in
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </Form>

                        {canRegister && (
                            <div className="text-center text-sm text-gray-500">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5} className="text-emerald-600 hover:text-emerald-700 font-semibold">
                                    Sign up for free
                                </TextLink>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side - Illustration/Branding */}
                <div className="hidden lg:flex flex-1 relative overflow-hidden">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500" />

                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }} />

                    {/* Glassmorphism card */}
                    <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                        <div className="max-w-md space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-bold leading-tight">
                                    Build something<br />
                                    <span className="text-emerald-100">extraordinary</span>
                                </h2>
                                <p className="text-lg text-emerald-100/80 leading-relaxed">
                                    Join thousands of professionals who trust our platform to power their business.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                                            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium">{feature.text}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                            <div className="absolute -top-20 -right-10 h-48 w-48 rounded-full bg-teal-400/20 blur-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
