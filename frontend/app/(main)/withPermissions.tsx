import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/layout/context/usercontext';

export const withPermissions = (WrappedComponent: any, requiredPermissions: string[]) => {
    return (props: any) => {
        const { user, isLoading } = useUserContext();
        const router = useRouter();

        useEffect(() => {
            if (isLoading) {
                const hasPermission = user && (user.grantAll || requiredPermissions.every((permission) => user.permissions.includes(permission)));

                if (!hasPermission) {
                    router.push('/auth/access');
                }
            }
        }, [user, requiredPermissions, router]);
        
        const hasPermission = user && (user.grantAll || requiredPermissions.every((permission) => user.permissions.includes(permission)));

        if (!hasPermission) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };
};
