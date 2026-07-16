'use client';

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User as UserIcon, Settings, ChevronUp, Moon, Sun } from 'lucide-react';

export function UserDropdown() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="flex w-full items-center justify-between p-2">
                <div className="flex items-center space-x-3 w-full">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                    <div className="flex flex-col space-y-1 w-full">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!session?.user) return null;

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="flex w-full items-center justify-between rounded-md p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                    <div className="flex items-center space-x-3 truncate">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <UserIcon size={16} />
                        </div>
                        <div className="flex flex-col items-start truncate">
                            <span className="truncate text-sm font-medium text-gray-900">{session.user.name}</span>
                            <span className="truncate text-xs text-gray-500">
                                {/* @ts-ignore - Role is attached in auth callback */}
                                {session.user.role || 'Developer'}
                            </span>
                        </div>
                    </div>
                    <ChevronUp size={16} className="text-gray-400" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content 
                    className="w-56 rounded-md bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5"
                    sideOffset={8}
                    align="end"
                >
                    <DropdownMenu.Label className="px-2 py-2 text-xs font-semibold text-gray-500">
                        My Account
                    </DropdownMenu.Label>

                    <DropdownMenu.Item className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 outline-none">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </DropdownMenu.Item>
                    
                    <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                    
                    <DropdownMenu.Item 
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50 outline-none"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}