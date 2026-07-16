import { ApolloWrapper } from '@/lib/apollo-provider';
import { AuthProvider } from '@/frontend/components/AuthProvider';
import { AppShell } from '@/frontend/components/AppShell';
import { Toaster } from 'react-hot-toast';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bug Tracker',
  description: 'Clean, focused developer issue tracking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ApolloWrapper>
              <AppShell>
                {children}
              </AppShell>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#333',
                    color: '#fff',
                    fontSize: '14px',
                    borderRadius: '8px',
                  },
                  success: {
                    iconTheme: { primary: '#22c55e', secondary: '#fff' },
                  },
                }}
              />
          </ApolloWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}