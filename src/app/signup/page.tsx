import SignUpClient from '@/frontend/views/SignUp';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SignUpPage() {
    const session = await getServerSession(authOptions);
    if (session) {
        redirect('/');
    }

    return <SignUpClient />;
}