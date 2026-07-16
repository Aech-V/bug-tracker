import React from 'react';

export default function DashboardLoading() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
            
            {/* Header Skeleton */}
            <div>
                <div className="h-8 w-48 bg-gray-200 rounded-md"></div>
                <div className="mt-2 h-4 w-96 bg-gray-200 rounded-md"></div>
            </div>

            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 flex items-center shadow-sm">
                        <div className="h-12 w-12 rounded-md bg-gray-200"></div>
                        <div className="ml-5 space-y-2 flex-1">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            <div className="h-6 w-12 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="h-10 w-full sm:w-64 bg-gray-200 rounded-md"></div>
                <div className="flex w-full sm:w-auto gap-4">
                    <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
                    <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
                </div>
            </div>

            {/* Data Table Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
                    ))}
                </div>
                <div className="divide-y divide-gray-200">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="px-6 py-5 flex gap-4 items-center bg-white">
                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                            <div className="h-4 flex-1 bg-gray-200 rounded"></div>
                            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                            <div className="h-6 w-20 bg-gray-200 rounded"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
}