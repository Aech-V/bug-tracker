import { getClient } from '@/lib/apollo-server';
import { GET_BUG_DETAILS } from '@/frontend/graphql/queries';
import BugDetailClient from '@/frontend/views/BugDetail';

export const dynamic = 'force-dynamic';

interface BugPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function BugDetailPage({ params }: BugPageProps) {
    try {
        const resolvedParams = await params;

        const { data, error } = await getClient().query({
            query: GET_BUG_DETAILS,
            variables: { id: resolvedParams.id },
            fetchPolicy: 'network-only',
        });

        if (error) {
            throw new Error(error.message);
        }

        if (!data || !data.bug) {
            return (
                <div className="flex h-screen items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">404 - Issue Not Found</h2>
                        <p className="mt-2 text-sm text-gray-500">The ticket you are looking for does not exist.</p>
                        <a href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
                            &larr; Return to Dashboard
                        </a>
                    </div>
                </div>
            );
        }

        return <BugDetailClient bug={data.bug} />;

    } catch (error) {
        console.error(`Failed to fetch bug details:`, error);
        
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600">Failed to load issue</h2>
                    <p className="mt-2 text-sm text-gray-500">Ensure the ID is valid and your database is connected.</p>
                </div>
            </div>
        );
    }
}