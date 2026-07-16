import React from 'react';

export default function BugDetailLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            
            {/* Header Skeleton */}
            <div className="mb-8 pb-5 border-b border-gray-200 space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                
                {/* LEFT COLUMN: Description & Discussion */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Description Box */}
                    <div className="bg-white px-6 py-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                        <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
                        <div className="h-24 w-full bg-gray-100 rounded mt-4"></div>
                    </div>
                    
                    {/* Comments Thread Skeleton */}
                    <div className="space-y-6">
                        <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0"></div>
                                <div className="flex-grow bg-white px-5 py-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                                    <div className="flex justify-between">
                                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: Sticky Sidebar */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50 space-y-3">
                            <div className="h-3 w-24 bg-gray-200 rounded"></div>
                            <div className="h-10 w-full bg-gray-200 rounded-md"></div>
                            <div className="h-10 w-full bg-gray-200 rounded-md"></div>
                        </div>
                        <div className="p-5 space-y-6">
                            <div className="space-y-2">
                                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                <div className="h-10 w-full bg-gray-200 rounded-md"></div>
                            </div>
                            <hr className="border-gray-100" />
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}