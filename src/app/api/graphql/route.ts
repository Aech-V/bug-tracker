import { createSchema, createYoga } from 'graphql-yoga';
import { typeDefs } from '@/backend/graphql/schema';
import { resolvers } from '@/backend/graphql/resolvers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

const schema = createSchema({
    typeDefs,
    resolvers,
});

const yoga = createYoga({
    schema,
    graphqlEndpoint: '/api/graphql',
    graphiql: process.env.NODE_ENV !== 'production',
    fetchAPI: { Request, Response },
    
    cors: {
        origin: process.env.FRONTEND_URL || 'https://your-vercel-domain.vercel.app', 
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS']
    },
    
    context: async () => {
        const session = await getServerSession(authOptions);
        return {
            user: session?.user || null
        };
    }
});

export async function GET(request: NextRequest, ctx: any) {
    return yoga.handleRequest(request, ctx);
}

export async function POST(request: NextRequest, ctx: any) {
    return yoga.handleRequest(request, ctx);
}

export async function OPTIONS(request: NextRequest, ctx: any) {
    return yoga.handleRequest(request, ctx);
}