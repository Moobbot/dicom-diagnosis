'use client';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../modules/base/styles/Base.scss';
import SlideSession from '@/components/SlideSession';
import { PrimeReactProvider } from 'primereact/api';
import { UserProvider } from '@/layout/context/usercontext';
import { LayoutProvider } from '@/layout/context/layoutcontext';
interface RootLayoutProps {
    children: React.ReactNode;
}

function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <PrimeReactProvider>
            <UserProvider>
                <LayoutProvider>{children}</LayoutProvider>
            </UserProvider>
        </PrimeReactProvider>
    );
}

// RootLayout
export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet" />
            </head>
            <body>
                <AppProviders>
                    <SlideSession />
                    {children}
                </AppProviders>
            </body>
        </html>
    );
}