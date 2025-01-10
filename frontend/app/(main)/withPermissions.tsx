import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/layout/context/usercontext';

export const withPermissions = (WrappedComponent: any, requiredPermissions: string[]) => {
    return (props: any) => {
        const { user, isLoading } = useUserContext();
        const router = useRouter();

        useEffect(() => {
            if (isLoading) {
                if (!user) {
                    router.push('/auth/login');
                }

                const hasPermission = user && (user.grantAll || requiredPermissions.every((permission) => user.permissions.includes(permission)));

                if (!hasPermission) {
                    router.push('/auth/access');
                }
            }
        }, [user, requiredPermissions, router]);

        if (!user) {
            return null;
        }

        const hasPermission = user && (user.grantAll || requiredPermissions.every((permission) => user.permissions.includes(permission)));

        if (!hasPermission) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };
};
