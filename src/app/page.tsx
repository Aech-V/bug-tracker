import { getClient } from '@/lib/apollo-server';
import { GET_BUGS } from '@/frontend/graphql/queries';
import DashboardClient from '@/frontend/views/Dashboard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    try {
        const { data, error } = await getClient().query({
            query: GET_BUGS,
            fetchPolicy: 'network-only', 
        });

        if (error) {
            throw new Error(error.message);
        }

        if (!data || !data.bugs) {
            throw new Error("GraphQL response did not contain the expected bugs data.");
        }

        return <DashboardClient bugs={data.bugs} />;

    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600">Failed to load issue tracker</h2>
                    <p className="mt-2 text-sm text-gray-500">Please check your database connection or server logs.</p>
                </div>
            </div>
        );
    }
}