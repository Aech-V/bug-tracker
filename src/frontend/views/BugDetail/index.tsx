'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { User as UserIcon, Calendar, Clock, AlertCircle, CheckCircle2, Trash2, ShieldAlert, Send, Code2 } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Button } from '../../components/Button';
import { UPDATE_BUG_STATUS, ADD_COMMENT, ASSIGN_BUG, DELETE_BUG } from '../../graphql/mutations';
import { GET_USERS } from '../../graphql/queries';
import { GetBugDetailsQuery, Status } from '../../graphql/generated/graphql';
import { AssigneeCombobox } from '../../components/AssigneeComboBox';


interface BugDetailProps {
    bug: NonNullable<GetBugDetailsQuery['bug']>;
}

// FIXED: Aligned with the backend's state machine. 
// A RESOLVED ticket must transition to IN_PROGRESS, not OPEN.
const VALID_TRANSITIONS: Record<Status, Status[]> = {
    'OPEN': ['IN_PROGRESS'],
    'IN_PROGRESS': ['RESOLVED'],
    'RESOLVED': ['IN_PROGRESS'], 
};

// Dynamically generate the label based on the current and target status
const getTransitionLabel = (targetStatus: Status, currentStatus: Status) => {
    if (targetStatus === 'IN_PROGRESS' && currentStatus === 'RESOLVED') return 'Reopen Ticket';
    if (targetStatus === 'IN_PROGRESS') return 'Start Progress';
    if (targetStatus === 'RESOLVED') return 'Mark as Resolved';
    return 'Update';
};

export default function BugDetailClient({ bug }: BugDetailProps) {
    const [commentText, setCommentText] = useState('');
    const timelineEndRef = useRef<HTMLDivElement>(null)
    const router = useRouter();
    const { data: session } = useSession();
    
    const { data: usersData } = useQuery(GET_USERS);
    const [updateStatus, { loading: updatingStatus }] = useMutation(UPDATE_BUG_STATUS);
    const [addComment, { loading: addingComment }] = useMutation(ADD_COMMENT);
    const [assignBug, { loading: assigningBug }] = useMutation(ASSIGN_BUG);
    const [deleteBug, { loading: deletingBug }] = useMutation(DELETE_BUG, {
        update(cache) {
            cache.modify({
                fields: {
                    bugs(existingBugs = [], { readField }) {
                        return existingBugs.filter(
                            (bugRef: any) => bug.id !== readField('id', bugRef)
                        );
                    }
                }
            });
        }
    });

    const isCreator = session?.user?.name === bug.createdBy.name || session?.user?.email === (bug.createdBy as any).email;
    
    let availableTransitions = VALID_TRANSITIONS[bug.status] || [];
    
    if (!isCreator) {
        availableTransitions = availableTransitions.filter(status => status !== 'RESOLVED');
    }

    const assignableUsers = usersData?.users.filter(
        (user: any) => user.name !== session?.user?.name && user.email !== session?.user?.email
    ) || [];

    const handleStatusTransition = async (newStatus: Status) => {
        try {
            await updateStatus({ variables: { id: bug.id, status: newStatus } });
            toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update bug status.");
        }
    };

    const handleAssigneeChange = async (newAssigneeId: string) => {
        try {
            await assignBug({
                variables: {
                    id: bug.id,
                    assignedToId: newAssigneeId === '' ? null : newAssigneeId
                }
            });
            toast.success("Ticket reassigned successfully.");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to reassign ticket.");
        }
    };

    const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            await addComment({ variables: { bugId: bug.id, text: commentText } });
            setCommentText('');
            toast.success("Comment added.");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to add comment.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this ticket? This action cannot be undone.")) return;

        try {
            await deleteBug({ variables: { id: bug.id } });
            toast.success("Ticket deleted successfully.");
            router.push('/');
        } catch (error: unknown) {
            if (error instanceof Error) toast.error(error.message);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (timelineEndRef.current) {
                timelineEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [bug.activities.length]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="mb-8 pb-6 border-b border-gray-100 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-3 mb-3">
                        <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{bug.ticketId}</span>
                        <StatusBadge status={bug.status} />
                        <PriorityBadge priority={bug.priority} />
                    </div>
                    <h2 className="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight">
                        {bug.title}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Reported by <span className="text-gray-900 font-bold">{bug.createdBy.name}</span> on{' '}
                        <time suppressHydrationWarning>
                            {new Date(Number(bug.createdAt)).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </time>
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <button
                        onClick={handleDelete}
                        disabled={deletingBug}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        Delete Ticket
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                {/* LEFT COLUMN: Main Content & Discussion */}
                <div className="lg:col-span-8 space-y-8">

                    <div className="bg-white px-6 py-8 shadow-xl ring-1 ring-gray-100 rounded-2xl">
                        <article className="prose prose-sm sm:prose-base prose-slate text-slate-700 max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-pre:bg-slate-900 prose-pre:rounded-xl prose-a:text-blue-600 hover:prose-a:text-blue-500">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {bug.description}
                            </ReactMarkdown>
                        </article>
                    </div>

                    {/* Discussion & Activity Timeline */}
                    <div className="pt-4">
                        <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                            Activity Timeline
                        </h3>

                        <div className="space-y-8 mb-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:via-gray-200 before:to-transparent">
                            {bug.activities.length === 0 ? (
                                <div className="text-sm font-medium text-gray-400 italic bg-gray-50/80 p-8 text-center rounded-2xl border border-dashed border-gray-200">
                                    No activity recorded yet.
                                </div>
                            ) : (
                                bug.activities.map((activity) => (
                                    <div key={activity.id} className="relative flex items-start gap-5 group">

                                        {/* Timeline Node Icon */}
                                        <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-white bg-white shadow-sm ring-1 ring-gray-100 transition-transform group-hover:scale-110 duration-300">
                                            {activity.type === 'COMMENT' && (
                                                <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-sm">
                                                    {activity.user.name.charAt(0)}
                                                </div>
                                            )}
                                            {activity.type === 'STATUS_CHANGE' && <div className="h-full w-full rounded-full bg-amber-50 flex items-center justify-center"><AlertCircle size={18} className="text-amber-600" /></div>}
                                            {activity.type === 'ASSIGNEE_CHANGE' && <div className="h-full w-full rounded-full bg-purple-50 flex items-center justify-center"><UserIcon size={18} className="text-purple-600" /></div>}
                                            {activity.type === 'TICKET_CREATED' && <div className="h-full w-full rounded-full bg-emerald-50 flex items-center justify-center"><CheckCircle2 size={18} className="text-emerald-600" /></div>}
                                        </div>

                                        {/* Timeline Content */}
                                        <div className="min-w-0 flex-1 pt-1.5">

                                            {/* Event: Comment */}
                                            {activity.type === 'COMMENT' && (
                                                <div className="bg-white px-5 py-4 rounded-2xl border border-gray-100 shadow-sm mt-1 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-sm font-extrabold text-gray-900">{activity.user.name}</span>
                                                        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                                            <time suppressHydrationWarning>
                                                                {new Date(Number(activity.createdAt)).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                            </time>
                                                        </span>
                                                    </div>
                                                    <article className="prose prose-sm prose-slate max-w-none prose-pre:bg-slate-900 prose-pre:rounded-lg">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {activity.text || ''}
                                                        </ReactMarkdown>
                                                    </article>
                                                </div>
                                            )}

                                            {/* Event: Status Change */}
                                            {activity.type === 'STATUS_CHANGE' && (
                                                <div className="py-2 text-sm text-gray-600 flex items-center flex-wrap gap-2">
                                                    <span className="font-bold text-gray-900">{activity.user.name}</span>
                                                    <span>changed status from</span>
                                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                                                        {activity.oldValue?.replace('_', ' ')}
                                                    </span>
                                                    <span>to</span>
                                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                                        {activity.newValue?.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-xs font-medium text-gray-400 ml-2">
                                                        <time suppressHydrationWarning>
                                                            {new Date(Number(activity.createdAt)).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                        </time>
                                                    </span>
                                                </div>
                                            )}

                                            {/* Event: Assignee Change */}
                                            {activity.type === 'ASSIGNEE_CHANGE' && (
                                                <div className="py-2 text-sm text-gray-600 flex items-center flex-wrap gap-2">
                                                    <span className="font-bold text-gray-900">{activity.user.name}</span>
                                                    <span>reassigned ticket from</span>
                                                    <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">{activity.oldValue || 'Unassigned'}</span>
                                                    <span>to</span>
                                                    <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded">{activity.newValue || 'Unassigned'}</span>
                                                    <span className="text-xs font-medium text-gray-400 ml-2">
                                                        <time suppressHydrationWarning>
                                                            {new Date(Number(activity.createdAt)).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                        </time>
                                                    </span>
                                                </div>
                                            )}

                                            {/* Event: Ticket Created */}
                                            {activity.type === 'TICKET_CREATED' && (
                                                <div className="py-2 text-sm text-gray-600 flex items-center flex-wrap gap-2">
                                                    <span className="font-bold text-gray-900">{activity.user.name}</span>
                                                    <span>created the ticket</span>
                                                    <span className="text-xs font-medium text-gray-400 ml-2">
                                                        <time suppressHydrationWarning>
                                                            {new Date(Number(activity.createdAt)).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                        </time>
                                                    </span>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={timelineEndRef} className="h-1 w-full" />
                        </div>

                        {/* Comment Form */}
                        <form onSubmit={handleAddComment} className="bg-white shadow-xl ring-1 ring-gray-100 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all mt-4 ml-0 md:ml-16">
                            <div className="px-5 py-5">
                                <textarea
                                    id="comment"
                                    rows={4}
                                    className="block w-full resize-y border-0 py-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-relaxed bg-transparent outline-none"
                                    placeholder="Add technical context, potential fixes, or ask for clarification..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="bg-gray-50/80 px-5 py-3 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100">
                                <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                    <Code2 size={14}/> Markdown supported (``` for code blocks)
                                </span>
                                <Button type="submit" isLoading={addingComment} disabled={!commentText.trim()} className="w-full sm:w-auto shadow-sm">
                                    <Send size={16} className="mr-2"/> Post Comment
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Sticky Metadata Sidebar */}
                <div className="lg:col-span-4">
                    <div className="bg-white shadow-xl ring-1 ring-gray-100 rounded-2xl sticky top-8 overflow-hidden flex flex-col">

                        {/* Quick Actions / Status Changes */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <AlertCircle size={14}/> Status Actions
                            </h4>
                            
                            <div className="flex flex-col space-y-3">
                                {availableTransitions.length > 0 ? (
                                    availableTransitions.map((targetStatus) => (
                                        <Button
                                            key={targetStatus}
                                            variant={targetStatus === 'RESOLVED' ? 'primary' : 'secondary'}
                                            onClick={() => handleStatusTransition(targetStatus)}
                                            isLoading={updatingStatus}
                                            className={`w-full justify-center shadow-sm py-2.5 font-bold ${targetStatus !== 'RESOLVED' ? 'bg-white border-gray-200' : ''}`}
                                        >
                                            {targetStatus === 'RESOLVED' && <CheckCircle2 size={18} className="mr-2" />}
                                            {getTransitionLabel(targetStatus, bug.status)}
                                        </Button>
                                    ))
                                ) : (
                                    bug.status !== 'RESOLVED' && !isCreator && (
                                        <div className="flex items-start gap-2 bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-100/50">
                                            <ShieldAlert size={16} className="shrink-0 mt-0.5"/>
                                            <p className="text-xs font-medium leading-relaxed">
                                                Only the user who created this ticket can mark it as resolved.
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="p-6 space-y-7">
                            {/* Inline Assignee Edit */}
                            <div>
                                <label className="flex items-center text-sm font-bold text-gray-900 mb-3">
                                    <UserIcon size={16} className="mr-2 text-blue-500" /> Assigned Developer
                                </label>
                                <div>
                                    <AssigneeCombobox
                                        users={assignableUsers}
                                        value={bug.assignedTo?.id || ''}
                                        onChange={handleAssigneeChange}
                                        disabled={assigningBug}
                                    />
                                    {usersData?.users && assignableUsers.length === 0 && (
                                        <p className="text-xs text-gray-400 mt-2 italic">No other developers available to assign.</p>
                                    )}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <dl className="space-y-5">
                                <div>
                                    <dt className="flex items-center text-sm font-bold text-gray-900 mb-2">
                                        <AlertCircle size={16} className="mr-2 text-blue-500" /> System Priority
                                    </dt>
                                    <dd className="mt-1"><PriorityBadge priority={bug.priority} /></dd>
                                </div>

                                <div>
                                    <dt className="flex items-center text-sm font-bold text-gray-900 mb-2">
                                        <Calendar size={16} className="mr-2 text-blue-500" /> Target Due Date
                                    </dt>
                                    <dd className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 inline-block">
                                        {bug.dueDate ? (
                                            <time suppressHydrationWarning>
                                                {new Date(Number(bug.dueDate)).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </time>
                                        ) : (
                                            <span className="text-gray-400 italic">No target date set</span>
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="flex items-center text-sm font-bold text-gray-900 mb-2">
                                        <Clock size={16} className="mr-2 text-blue-500" /> Last Updated
                                    </dt>
                                    <dd className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 inline-block">
                                        <time suppressHydrationWarning>
                                            {new Date(Number(bug.updatedAt)).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                        </time>
                                    </dd>
                                </div>

                                <div className="pt-4 mt-4 border-t border-gray-100">
                                    <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Database Reference ID</dt>
                                    <dd className="font-mono text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100 truncate" title={bug.id}>
                                        {bug.id}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}