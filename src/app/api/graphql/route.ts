import { createSchema, createYoga } from 'graphql-yoga';
import { typeDefs } from '@/backend/graphql/schema';
import { resolvers } from '@/backend/graphql/resolvers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const schema = createSchema({
    typeDefs,
    resolvers,
});

const { handleRequest } = createYoga({
    schema,
    graphqlEndpoint: '/api/graphql',
    graphiql: process.env.NODE_ENV !== 'production',
    fetchAPI: { Request, Response },
    
    context: async () => {
        const session = await getServerSession(authOptions);
        return {
            user: session?.user || null
        };
    }
});

export { handleRequest as GET, handleRequest as POST, handleRequest as OPTIONS };