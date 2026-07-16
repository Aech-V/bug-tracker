'use client';

import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

interface User {
    id: string;
    name: string;
}

interface AssigneeComboboxProps {
    users: User[];
    value: string;
    onChange: (userId: string) => void;
    disabled?: boolean;
}

export function AssigneeCombobox({ users, value, onChange, disabled }: AssigneeComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const selectedUser = users.find((user) => user.id === value);

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (!open) setSearch('');
    }, [open]);

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    disabled={disabled}
                    className={`flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                >
                    <span className="truncate">{selectedUser ? selectedUser.name : 'Unassigned'}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
                </button>
            </Popover.Trigger>
            
            <Popover.Portal>
                <Popover.Content
                    align="start"
                    className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] rounded-md border border-gray-200 bg-white shadow-lg outline-none animate-in fade-in zoom-in-95"
                    sideOffset={4}
                >
                    <div className="flex w-full flex-col overflow-hidden rounded-md bg-white text-gray-900">
                        {/* Search Input */}
                        <div className="flex items-center border-b border-gray-100 px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search developers..."
                                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                                autoFocus
                            />
                        </div>
                        
                        {/* Filtered Results */}
                        <div className="max-h-60 overflow-y-auto p-1">
                            {filteredUsers.length === 0 ? (
                                <div className="py-6 text-center text-sm text-gray-500">
                                    No developers found.
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-1">
                                    <button
                                        onClick={() => {
                                            onChange('');
                                            setOpen(false);
                                        }}
                                        className="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 transition-colors"
                                    >
                                        <Check
                                            className={`mr-2 h-4 w-4 ${value === '' ? 'opacity-100 text-blue-600' : 'opacity-0'}`}
                                        />
                                        <span className="italic text-gray-600">Unassigned</span>
                                    </button>
                                    
                                    {filteredUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => {
                                                onChange(user.id);
                                                setOpen(false);
                                            }}
                                            className="relative flex w-full cursor-pointer items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 transition-colors"
                                        >
                                            <Check
                                                className={`mr-2 h-4 w-4 ${value === user.id ? 'opacity-100 text-blue-600' : 'opacity-0'}`}
                                            />
                                            {user.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}