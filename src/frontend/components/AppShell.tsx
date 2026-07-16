'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Bug, Menu, X } from 'lucide-react';
import { UserDropdown } from './UserDropdown';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Report Issue', href: '/bug/new', icon: PlusCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
                <div className="flex flex-1 flex-col min-h-0">
                    <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
                        <Bug className="h-8 w-8 text-blue-600" />
                        <span className="ml-3 text-lg font-bold text-gray-900 tracking-tight">Tracker</span>
                    </div>
                    <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                    <UserDropdown />
                </div>
            </div>

            <div className="md:hidden fixed top-0 left-0 right-0 z-10 flex h-16 items-center justify-between bg-white px-4 border-b border-gray-200">
                <div className="flex items-center">
                    <Bug className="h-8 w-8 text-blue-600" />
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-gray-500 hover:text-gray-900 focus:outline-none"
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-0 bg-white pt-16">
                    <nav className="space-y-1 px-4 py-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center px-3 py-3 text-base font-medium rounded-md ${pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                                    }`}
                            >
                                <item.icon className="mr-4 h-6 w-6 text-gray-500" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                    <div className="px-4 py-4 border-t border-gray-200">
                        <UserDropdown />
                    </div>
                </div>
            )}

            <main className="flex-1 md:pl-64 pt-16 md:pt-0">
                {children}
            </main>
        </div>
    );
}