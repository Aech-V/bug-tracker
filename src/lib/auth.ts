import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './mongoose';
import { User } from '@/backend/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login', 
    },
    providers: [
        CredentialsProvider({
            id: 'standard',
            name: 'Standard Login',
            credentials: {
                email: { type: "email" },
                password: { type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) throw new Error("Credentials missing.");

                await connectToDatabase();
                const user = await User.findOne({ email: credentials.email }).select('+password');
                
                if (!user || !user.password) throw new Error("Invalid email or password.");
                
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) throw new Error("Invalid email or password.");
                
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            }
        }),

        CredentialsProvider({
            id: 'developer',
            name: 'Backend Portal',
            credentials: {
                email: { type: "email" },
                devSecret: { type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.devSecret) throw new Error("Credentials missing.");

                if (credentials.devSecret !== process.env.BACKEND_DEV_SECRET) {
                    throw new Error("Security Violation: Invalid Developer Secret.");
                }

                await connectToDatabase();
                const user = await User.findOne({ email: credentials.email });
                
                if (!user) throw new Error("User not found.");

                if (user.role !== 'ADMIN') {
                    throw new Error("Access Denied: This portal is reserved strictly for backend developers.");
                }
                
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).role = token.role as string;
            }
            return session;
        }
    }
};