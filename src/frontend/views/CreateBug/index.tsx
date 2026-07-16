'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import * as Tabs from '@radix-ui/react-tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Code2, UploadCloud, Bug, Trash2, Info } from 'lucide-react';
import { Button } from '../../components/Button';
import { CREATE_BUG } from '../../graphql/mutations';
import { GET_BUGS, GET_USERS } from '../../graphql/queries';
import { Priority } from '../../graphql/generated/graphql';
import toast from 'react-hot-toast';

interface Attachment {
    name: string;
    content: string;
    extension: string;
}

export default function CreateBugClient() {
    const router = useRouter();
    const { data: session } = useSession();

    const today = new Date().toISOString().split('T')[0];

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [priority, setPriority] = useState<Priority>('MEDIUM');
    const [assignedToId, setAssignedToId] = useState('');
    const [dueDate, setDueDate] = useState(today);

    const { data: usersData } = useQuery(GET_USERS);

    const [createBug, { loading }] = useMutation(CREATE_BUG, {
        update(cache, { data }) {
            if (!data?.createBug) return;

            try {
                const existingData: any = cache.readQuery({ query: GET_BUGS });

                if (existingData && existingData.bugs) {
                    cache.writeQuery({
                        query: GET_BUGS,
                        data: {
                            bugs: [data.createBug, ...existingData.bugs]
                        }
                    });
                }
            } catch (error) {
                // Cache might be empty, ignore
            }
        }
    });

    const hasManualCode = description.includes('```');
    const hasAttachments = attachments.length > 0;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (hasManualCode) {
            toast.error('You cannot upload a file while manually inputted code is present.');
            e.target.value = '';
            return;
        }

        const MAX_FILE_SIZE = 500 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File is too large. Maximum size is 500KB.');
            e.target.value = '';
            return;
        }
        const allowedExtensions = ['js', 'jsx', 'ts', 'tsx', 'json', 'css', 'html', 'md', 'txt', 'csv'];
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        if (!allowedExtensions.includes(extension)) {
            toast.error('Invalid file format. Please upload text or code files only.');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setAttachments(prev => [...prev, { name: file.name, content, extension }]);
        };
        reader.readAsText(file);

        e.target.value = '';
    };

    const removeAttachment = (indexToRemove: number) => {
        setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Extract only code blocks wrapped in backticks from the description
    const extractedCodeBlocks = description.match(/```[\s\S]*?```/g) || [];

    const getCombinedMarkdown = () => {
        const attachmentsMarkdown = attachments.map(
            (file) => `\n\n### Attached Code: \`${file.name}\`\n\`\`\`${file.extension}\n${file.content}\n\`\`\`\n`
        ).join('');
        return description + attachmentsMarkdown;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const finalDescription = getCombinedMarkdown();

        if (!title.trim() || !finalDescription.trim()) {
            toast.error('Title and Description (or attachment) are required.');
            return;
        }

        try {
            await createBug({
                variables: {
                    title,
                    description: finalDescription,
                    priority,
                    assignedToId: assignedToId || null,
                    dueDate: dueDate || null
                },
            });
            toast.success("Ticket created successfully!");
            router.push('/');
        } catch (error: unknown) { 
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to create the issue due to an unknown error.');
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
            
            {/* Header Section */}
            <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                    <Bug size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold leading-7 text-gray-900 tracking-tight">
                        Report New Issue
                    </h2>
                    <p className="mt-1.5 text-sm font-medium text-gray-500">
                        Provide clear, minimal context to help developers resolve this efficiently.
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="bg-white shadow-xl ring-1 ring-gray-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-8 sm:p-10 space-y-8">

                    {/* Top Meta Data Grid */}
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        
                        {/* Title */}
                        <div className="sm:col-span-6">
                            <label htmlFor="title" className="block text-sm font-semibold leading-6 text-gray-900 mb-2">
                                Issue Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                required
                                autoFocus
                                className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all outline-none"
                                placeholder="e.g., Authentication token dropped on hard refresh"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Priority */}
                        <div className="sm:col-span-2">
                            <label htmlFor="priority" className="block text-sm font-semibold leading-6 text-gray-900 mb-2">
                                Priority
                            </label>
                            <select
                                id="priority"
                                className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all outline-none cursor-pointer bg-white"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as Priority)}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High / Critical</option>
                            </select>
                        </div>

                        {/* Assignee Dropdown */}
                        <div className="sm:col-span-2">
                            <label htmlFor="assignee" className="block text-sm font-semibold leading-6 text-gray-900 mb-2">
                                Assign To
                            </label>
                            <select
                                id="assignee"
                                className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all outline-none cursor-pointer bg-white"
                                value={assignedToId}
                                onChange={(e) => setAssignedToId(e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {usersData?.users
                                    .filter((user: any) => user.email !== session?.user?.email && user.name !== session?.user?.name)
                                    .map((user: any) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        {/* Due Date Picker */}
                        <div className="sm:col-span-2">
                            <label htmlFor="dueDate" className="block text-sm font-semibold leading-6 text-gray-900 mb-2">
                                Target Date
                            </label>
                            <input
                                type="date"
                                id="dueDate"
                                min={today}
                                className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all outline-none cursor-pointer"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Markdown Editor Section */}
                    <div className="pt-2 border-t border-gray-100 mt-6">
                        <div className="flex justify-between items-end mb-3 mt-6">
                            <label className="block text-sm font-semibold leading-6 text-gray-900">
                                Technical Description <span className="text-red-500">*</span>
                            </label>

                            {/* File Upload Button (Disabled if manual code exists) */}
                            <div>
                                <input
                                    type="file"
                                    id="codeUpload"
                                    className="hidden"
                                    accept=".js,.jsx,.ts,.tsx,.json,.css,.html,.md,.txt,.csv"
                                    onChange={handleFileUpload}
                                    disabled={hasManualCode}
                                />
                                <label
                                    htmlFor={hasManualCode ? "" : "codeUpload"}
                                    onClick={() => {
                                        if (hasManualCode) toast.error("Remove manually inputted code blocks to upload files.");
                                    }}
                                    className={`cursor-pointer inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-lg transition-all border shadow-sm ${
                                        hasManualCode 
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border-blue-100'
                                    }`}
                                >
                                    <UploadCloud size={16} />
                                    Upload File
                                </label>
                            </div>
                        </div>

                        {/* Tabs Container */}
                        <Tabs.Root defaultValue="write" className="flex flex-col w-full ring-1 ring-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all bg-white shadow-sm">
                            
                            <Tabs.List className="flex bg-gray-50/80 border-b border-gray-200 p-1.5 gap-1">
                                <Tabs.Trigger
                                    value="write"
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all outline-none"
                                >
                                    <Code2 size={16} />
                                    Write
                                </Tabs.Trigger>
                                <Tabs.Trigger
                                    value="preview"
                                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all outline-none"
                                >
                                    <Eye size={16} />
                                    Preview Codes
                                </Tabs.Trigger>
                            </Tabs.List>

                            <Tabs.Content value="write" className="p-0 outline-none flex flex-col">
                                {/* Compact Editor Instructions */}
                                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center gap-2 text-xs text-gray-500">
                                    <Info size={14} className="text-blue-500 shrink-0" />
                                    <span>Tip: Format code manually using triple backticks (e.g., <code className="bg-gray-200 px-1 py-0.5 rounded font-mono text-gray-700">```javascript ... ```</code>).</span>
                                </div>
                                <textarea
                                    id="description"
                                    rows={10}
                                    required={attachments.length === 0}
                                    className="block w-full resize-y border-0 bg-transparent py-4 px-5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-relaxed"
                                    placeholder="Describe the issue, steps to reproduce, or paste error logs here..."
                                    value={description}
                                    onChange={(e) => {
                                        const newVal = e.target.value;
                                        if (hasAttachments && newVal.includes('```')) {
                                            if (!description.includes('```')) {
                                                toast.error('Remove uploaded files to input code manually.');
                                            }
                                            return;
                                        }
                                        setDescription(newVal);
                                    }}
                                />
                            </Tabs.Content>

                            <Tabs.Content value="preview" className="p-5 outline-none min-h-[260px] bg-white">
                                {extractedCodeBlocks.length === 0 && attachments.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-sm font-medium text-gray-400 mt-8 bg-gray-50/50 py-12 rounded-lg border border-dashed border-gray-200">
                                        No code detected. Upload a file or format code with backticks (```) in the Write tab.
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        
                                        {/* Inputted Code Preview */}
                                        {extractedCodeBlocks.length > 0 && (
                                            <div>
                                                <div className="space-y-4">
                                                    {extractedCodeBlocks.map((block, idx) => (
                                                        <article key={idx} className="prose prose-sm max-w-none prose-slate text-slate-700 prose-headings:text-slate-900 prose-pre:bg-gray-900 prose-pre:rounded-xl">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {block}
                                                            </ReactMarkdown>
                                                        </article>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Uploaded Files Preview */}
                                        {attachments.length > 0 && (
                                            <div>
                                                <div className="space-y-4">
                                                    {attachments.map((file, index) => (
                                                        <div key={index} className="relative">
                                                            <div className="flex justify-between items-center mb-1.5 px-1">
                                                                <span className="text-xs font-bold text-gray-600 font-mono flex items-center gap-1.5">
                                                                    <Code2 size={14} /> {file.name}
                                                                </span>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => removeAttachment(index)} 
                                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1" 
                                                                    title="Remove attachment"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                            <article className="prose prose-sm max-w-none prose-slate text-slate-700 prose-headings:text-slate-900 prose-pre:bg-gray-900 prose-pre:rounded-xl prose-pre:m-0">
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                    {`\`\`\`${file.extension}\n${file.content}\n\`\`\``}
                                                                </ReactMarkdown>
                                                            </article>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}
                            </Tabs.Content>
                        </Tabs.Root>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-x-4 border-t border-gray-100 px-6 py-5 sm:px-10 bg-gray-50/80">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-sm font-bold leading-6 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <Button type="submit" isLoading={loading} className="px-6 py-2.5 shadow-sm rounded-lg text-sm font-bold">
                        Create Ticket
                    </Button>
                </div>
            </form>
        </div>
    );
}