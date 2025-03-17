import { Metadata } from 'next';
import React, { Suspense } from 'react';
import Layout from '../../layout/layout';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'NewLife LCRD - Lung Cancer Risk Diagnosis',
    description: 'NewLife Team to develop this application. The ultimate collection of design-agnostic, flexible and accessible React UI Components.',
    robots: { index: false, follow: false },
    openGraph: {
        type: 'website',
        title: 'Base on PrimeReact SAKAI-REACT',
        url: '#',
        description: '#',
        images: ['https://www.primefaces.org/static/social/sakai-react.png'],
        ttl: 604800
    },
    icons: {
        icon: '/favicon.ico'
    }
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};


export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Layout>{children}</Layout>
        </Suspense>
    );
}
