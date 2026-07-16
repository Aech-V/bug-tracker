'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { Search, AlertCircle, Clock, CheckCircle2, Ticket, List, Columns, Trash2 } from 'lucide-react';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import toast from 'react-hot-toast';
import { StatusBadge } from '@/frontend/components/StatusBadge';
import { PriorityBadge } from '@/frontend/components/PriorityBadge';
import { Status, Priority } from '@/frontend/graphql/generated/graphql';
import { UPDATE_BUG_STATUS, DELETE_BUG } from '@/frontend/graphql/mutations'; // Ensure DELETE_BUG is exported in your mutations

interface Bug {
    id: string;
    ticketId: string;
    title: string;
    status: Status;
    priority: Priority;
    createdAt: string;
    dueDate?: string | null;
    assignee?: {
        name: string;
    } | null;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
    OPEN: ['IN_PROGRESS'],
    IN_PROGRESS: ['OPEN', 'RESOLVED'],
    RESOLVED: ['IN_PROGRESS']
};

interface DashboardClientProps {
    bugs: Bug[];
}

export default function DashboardClient({ bugs }: { bugs: Bug[] }) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');

    const [updateStatus] = useMutation(UPDATE_BUG_STATUS);
    const [deleteBug] = useMutation(DELETE_BUG);

    const metrics = useMemo(() => {
        const open = bugs.filter((b) => b.status !== 'RESOLVED').length;
        const highPriority = bugs.filter((b) => b.priority === 'HIGH').length;
        const resolved = bugs.filter((b) => b.status === 'RESOLVED').length;

        return { open, highPriority, resolved, total: bugs.length };
    }, [bugs]);

    const filteredBugs = useMemo(() => {
        return bugs.filter((bug) => {
            const matchesSearch =
                bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bug.ticketId.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || bug.status === statusFilter;
            const matchesPriority = priorityFilter === 'ALL' || bug.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [bugs, searchQuery, statusFilter, priorityFilter]);

    // Handle Drag and Drop
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const bugId = active.id as string;
        const newStatus = over.id as Status;
        const bug = bugs.find(b => b.id === bugId);

        if (!bug || bug.status === newStatus) return;

        if (!VALID_TRANSITIONS[bug.status].includes(newStatus)) {
            toast.error(`Invalid move: Cannot transition from ${bug.status.replace('_', ' ')} to ${newStatus.replace('_', ' ')}`);
            return;
        }

        try {
            await updateStatus({ variables: { id: bugId, status: newStatus } });
            toast.success(`Moved to ${newStatus.replace('_', ' ')}`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    // Handle Delete
    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevents the row/card click event from firing
        
        if (window.confirm('Are you sure you want to permanently delete this issue?')) {
            try {
                await deleteBug({ variables: { id } });
                toast.success('Ticket deleted successfully');
                router.refresh(); // Refresh server data to remove the item from the list
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete ticket');
            }
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header & View Toggle */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="mt-1.5 text-sm text-gray-500 font-medium">
                        Overview of all tracked issues and current system health.
                    </p>
                </div>
                <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200">
                    <button 
                        onClick={() => setViewMode('list')} 
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <List size={18} />
                    </button>
                    <button 
                        onClick={() => setViewMode('board')} 
                        className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <Columns size={18} />
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Issues"
                    value={metrics.total}
                    icon={<Ticket className="h-6 w-6 text-blue-600" />}
                    bgColor="bg-blue-50"
                />
                <MetricCard
                    title="Open Issues"
                    value={metrics.open}
                    icon={<Clock className="h-6 w-6 text-amber-600" />}
                    bgColor="bg-amber-50"
                />
                <MetricCard
                    title="High Priority"
                    value={metrics.highPriority}
                    icon={<AlertCircle className="h-6 w-6 text-red-600" />}
                    bgColor="bg-red-50"
                />
                <MetricCard
                    title="Resolved"
                    value={metrics.resolved}
                    icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />}
                    bgColor="bg-emerald-50"
                />
            </div>

            {/* Toolbar (Search & Filters) */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                <div className="relative w-full sm:max-w-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search ticket ID or title..."
                        className="block w-full rounded-lg border-gray-200 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600/20 focus:border-blue-600 sm:text-sm transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex w-full sm:w-auto gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full rounded-lg border-gray-200 py-2.5 pl-3 pr-8 text-gray-700 font-medium ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600/20 sm:text-sm transition-all cursor-pointer"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="block w-full rounded-lg border-gray-200 py-2.5 pl-3 pr-8 text-gray-700 font-medium ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-blue-600/20 sm:text-sm transition-all cursor-pointer"
                    >
                        <option value="ALL">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>
            </div>

            {/* CONDITIONAL RENDERING: LIST VS BOARD */}
            {viewMode === 'list' ? (
                /* Data Table / Mobile Cards (List View) */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* DESKTOP VIEW: Standard Data Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignee</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {filteredBugs.length > 0 ? (
                                    filteredBugs.map((bug) => (
                                        <tr 
                                            key={bug.id} 
                                            onClick={() => router.push(`/bug/${bug.id}`)}
                                            className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                                {bug.ticketId}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium max-w-md truncate group-hover:text-gray-900 transition-colors">
                                                {bug.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={bug.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><PriorityBadge priority={bug.priority} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {bug.assignee?.name || <span className="text-gray-400 italic">Unassigned</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <time suppressHydrationWarning>
                                                    {new Date(Number(bug.createdAt)).toLocaleDateString()}
                                                </time>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button
                                                    onClick={(e) => handleDelete(e, bug.id)}
                                                    className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete ticket"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-0 border-b-0">
                                            <EmptyStateIndicator
                                                isFiltered={searchQuery !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL'}
                                                onClearFilters={() => { setSearchQuery(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); }}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE VIEW: Stacked Cards */}
                    <div className="md:hidden flex flex-col p-4 gap-4 bg-gray-50/50">
                        {filteredBugs.length > 0 ? (
                            filteredBugs.map((bug) => (
                                <div 
                                    key={bug.id} 
                                    onClick={() => router.push(`/bug/${bug.id}`)}
                                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md hover:border-blue-200 cursor-pointer relative group"
                                >
                                    <div className="flex justify-between items-start pr-8">
                                        <span className="text-sm font-bold text-blue-600">
                                            {bug.ticketId}
                                        </span>
                                        <StatusBadge status={bug.status} />
                                    </div>
                                    
                                    <button
                                        onClick={(e) => handleDelete(e, bug.id)}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <p className="text-sm text-gray-900 font-medium line-clamp-2">{bug.title}</p>

                                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
                                        <PriorityBadge priority={bug.priority} />
                                        <span className="text-xs font-medium text-gray-500">
                                            {bug.assignee?.name || 'Unassigned'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyStateIndicator
                                isFiltered={searchQuery !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL'}
                                onClearFilters={() => { setSearchQuery(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); }}
                            />
                        )}
                    </div>
                </div>
            ) : (
                /* Kanban Board View */
                <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KanbanColumn 
                            id="OPEN" title="Open" 
                            bugs={filteredBugs.filter(b => b.status === 'OPEN')} 
                            onCardClick={(id) => router.push(`/bug/${id}`)}
                            onDelete={handleDelete}
                        />
                        <KanbanColumn 
                            id="IN_PROGRESS" title="In Progress" 
                            bugs={filteredBugs.filter(b => b.status === 'IN_PROGRESS')} 
                            onCardClick={(id) => router.push(`/bug/${id}`)}
                            onDelete={handleDelete}
                        />
                        <KanbanColumn 
                            id="RESOLVED" title="Resolved" 
                            bugs={filteredBugs.filter(b => b.status === 'RESOLVED')} 
                            onCardClick={(id) => router.push(`/bug/${id}`)}
                            onDelete={handleDelete}
                        />
                    </div>
                </DndContext>
            )}

        </div>
    );
}

function MetricCard({ title, value, icon, bgColor }: { title: string; value: number; icon: React.ReactNode; bgColor: string }) {
    return (
        <div className="bg-white overflow-hidden rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className={`p-4 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                <p className="mt-1.5 text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function EmptyStateIndicator({ isFiltered, onClearFilters }: { isFiltered: boolean; onClearFilters: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center text-center px-6 py-20 bg-white rounded-2xl">
            <div className="bg-blue-50/50 p-5 rounded-full mb-5 ring-4 ring-blue-50">
                <Search className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
                {isFiltered ? "No matching tickets found" : "No tickets created yet"}
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm leading-relaxed">
                {isFiltered
                    ? "Try adjusting your search query, status, or priority filters to find what you're looking for."
                    : "Get started by logging your first bug report or feature request."}
            </p>
            {isFiltered && (
                <button
                    onClick={onClearFilters}
                    className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-5 py-2.5 rounded-lg transition-colors"
                >
                    Clear all filters
                </button>
            )}
        </div>
    );
}

function KanbanColumn({ id, title, bugs, onCardClick, onDelete }: { id: string, title: string, bugs: Bug[], onCardClick: (id: string) => void, onDelete: (e: React.MouseEvent, id: string) => void }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className="bg-gray-50/80 rounded-2xl p-4 flex flex-col gap-4 border border-gray-100 min-h-[500px]">
            <div className="flex justify-between items-center font-bold text-gray-700 px-1">
                {title} 
                <span className="bg-white border border-gray-200 shadow-sm px-2.5 py-0.5 rounded-full text-xs text-gray-600">
                    {bugs.length}
                </span>
            </div>
            {bugs.map(bug => <KanbanCard key={bug.id} bug={bug} onClick={() => onCardClick(bug.id)} onDelete={(e) => onDelete(e, bug.id)} />)}
        </div>
    );
}

function KanbanCard({ bug, onClick, onDelete }: { bug: Bug, onClick: () => void, onDelete: (e: React.MouseEvent) => void }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: bug.id });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 } : undefined;

    return (
        <div
            ref={setNodeRef} style={style} {...listeners} {...attributes}
            onClick={onClick}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-200 transition-all relative group"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    {bug.ticketId}
                </div>
                <button
                    onClick={onDelete}
                    className="text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 -mt-1 -mr-1"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-relaxed">{bug.title}</h3>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <PriorityBadge priority={bug.priority} />
                <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md truncate max-w-[100px]">
                    {bug.assignee?.name || 'Unassigned'}
                </span>
            </div>
        </div>
    );
}