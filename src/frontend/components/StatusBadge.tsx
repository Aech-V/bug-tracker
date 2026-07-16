import React from 'react';
import { Status } from '../graphql/generated/graphql';

interface StatusBadgeProps {
    status: Status;
}

const statusStyles: Record<Status, string> = {
    OPEN: 'bg-gray-100 text-gray-800 border-gray-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
    RESOLVED: 'bg-green-100 text-green-800 border-green-200',
};

const statusLabels: Record<Status, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status]}`}
        >
            {statusLabels[status]}
        </span>
    );
};