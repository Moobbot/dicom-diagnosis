import { Permissions } from '@/enums/permissions.enums';
import { getCookie } from 'cookies-next';

const RBAC = () => {
    let permissions: string[];
    if (getCookie('grantAll') === 'true') {
        permissions = Object.values(Permissions);
    } else {
        const permissionsCookie = getCookie('permissions');
        permissions = permissionsCookie ? JSON.parse(permissionsCookie as string) : [];
    }
    return permissions;
};

export default RBAC;
