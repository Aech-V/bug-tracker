import React from 'react';
import { Priority } from '../graphql/generated/graphql';

interface PriorityBadgeProps {
    priority: Priority;
}

const priorityStyles: Record<Priority, string> = {
    LOW: 'text-gray-500 bg-gray-50',
    MEDIUM: 'text-orange-600 bg-orange-50',
    HIGH: 'text-red-700 bg-red-50 font-bold',
};

const PriorityIcon = ({ priority }: { priority: Priority }) => {
    if (priority === 'HIGH') {
        return (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
        );
    }
    return null;
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
    const formattedPriority = priority.charAt(0) + priority.slice(1).toLowerCase();

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs border border-transparent ${priorityStyles[priority]}`}
        >
            <PriorityIcon priority={priority} />
            {formattedPriority}
        </span>
    );
};