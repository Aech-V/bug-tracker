import type { CodegenConfig } from '@graphql-codegen/cli';
import { typeDefs } from './src/backend/graphql/schema';

const config: CodegenConfig = {
    schema: typeDefs,
    documents: ['src/frontend/graphql/**/*.ts'],
    ignoreNoDocuments: true,

    generates: {
        'src/backend/graphql/generated/types.ts': {
            plugins: ['typescript', 'typescript-resolvers'],
            config: {
                scalars: {
                    ID: 'string',
                },
                mappers: {
                    User: '@/backend/models/User#IUser',
                    Bug: '@/backend/models/Bug#IBug',
                    // The Comment mapper was removed here
                }
            }
        },

        'src/frontend/graphql/generated/': {
            preset: 'client',
            presetConfig: {
                fragmentMasking: false,
            }
        }
    }
};

export default config;