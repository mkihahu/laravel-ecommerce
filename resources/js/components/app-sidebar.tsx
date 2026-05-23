import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Package, ShoppingCart, Users, FolderTree, Ticket, UserCog, Tag, Settings2, Star } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard as adminDashboard } from '@/routes/admin';
import { dashboard as staffDashboard } from '@/routes/staff';
import products from '@/routes/admin/products';
import type { NavItem } from '@/types';

function getDashboardUrl(role: string): string {
    switch (role) {
        case 'admin':
            return adminDashboard();
        case 'staff':
            return staffDashboard();
        case 'customer':
        default:
            return '/customer/my-account';
    }
}

export function AppSidebar() {
    const { auth } = usePage().props;
    const dashboardUrl = getDashboardUrl(auth?.user?.role || 'customer');

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
    ];

    const adminNavItems: NavItem[] = auth?.user?.role === 'admin' ? [
        {
            title: 'Products',
            href: products.index(),
            icon: Package,
        },
        {
            title: 'Categories',
            href: '/admin/categories',
            icon: FolderTree,
        },
        {
            title: 'Brands',
            href: '/admin/brands',
            icon: Tag,
        },
        {
            title: 'Orders',
            href: '/admin/orders',
            icon: ShoppingCart,
        },
        {
            title: 'Customers',
            href: '/admin/customers',
            icon: Users,
        },
        {
            title: 'Coupons',
            href: '/admin/coupons',
            icon: Ticket,
        },
        {
            title: 'Users',
            href: '/admin/users',
            icon: UserCog,
        },
        {
            title: 'Reviews',
            href: '/admin/reviews',
            icon: Star,
        },
        {
            title: 'Payment Settings',
            href: '/admin/payment-settings',
            icon: Settings2,
        },
    ] : [];

    const staffNavItems: NavItem[] = auth?.user?.role === 'staff' ? [
        {
            title: 'Orders',
            href: '/staff/orders',
            icon: ShoppingCart,
        },
        {
            title: 'Coupons',
            href: '/staff/coupons',
            icon: Ticket,
        },
    ] : [];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {adminNavItems.length > 0 && (
                    <NavMain items={adminNavItems} />
                )}
                {staffNavItems.length > 0 && (
                    <NavMain items={staffNavItems} />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}