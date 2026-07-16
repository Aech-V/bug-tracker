import { HttpLink } from '@apollo/client';
import {
    registerApolloClient,
    ApolloClient,
    InMemoryCache,
} from '@apollo/client-integration-nextjs';

export const { getClient } = registerApolloClient(() => {
    return new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({
            uri: process.env.NEXT_PUBLIC_SITE_URL
                ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/graphql`
                : 'http://localhost:3000/api/graphql',
        }),
    });
});