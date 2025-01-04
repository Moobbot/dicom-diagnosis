import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { getCookie } from 'cookies-next';

interface WithAuthProps {
    children: ReactNode;
}

const WithAuth = ({ children }: WithAuthProps) => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const token = getCookie('accessToken');
        if (!token) {
            router.replace('/auth/login');
        }
    }, [router]);

    if (!isClient) {
        // Return null on the server to avoid mismatched content during SSR
        return null;
    }

    return <>{children}</>;
};

export default WithAuth;