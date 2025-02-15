'use client';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../modules/base/styles/Base.scss';
import { PrimeReactProvider } from 'primereact/api';
import UserProvider from '@/layout/context/usercontext';
import { LayoutProvider } from '@/layout/context/layoutcontext';
interface RootLayoutProps {
    children: React.ReactNode;
}

// RootLayout
export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/themes/bootstrap4-dark-purple/theme.css`} rel="stylesheet" />
            </head>
            <body>
                <PrimeReactProvider>
                    <UserProvider>
                        <LayoutProvider>{children}</LayoutProvider>
                    </UserProvider>
                </PrimeReactProvider>
            </body>
        </html>
    );
}