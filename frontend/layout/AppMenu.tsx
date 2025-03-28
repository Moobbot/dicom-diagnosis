/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';
import { Permissions } from '@/enums/permissions.enums';
import { useUserContext } from './context/usercontext';

const AppMenu = () => {
    // Lấy danh sách quyền của người dùng
    const { user } = useUserContext();

    const { layoutConfig } = useContext(LayoutContext);

    // Hàm kiểm tra quyền
    const hasPermission = (permissions: Permissions[]) => {
        return user && (user.grant_all || permissions.every(permission => user.permissions.includes(permission)));
    };

    // Xây dựng danh sách menu
    const model: AppMenuItem[] = [
        {
            label: 'HOME',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
                // { label: "DICOM Viewer and Predict 1", icon: 'pi pi-fw pi-image', to: '/dicom-viewer' },
                { label: "DICOM Viewer and Predict", icon: 'pi pi-fw pi-image', to: '/lcrd' },
                ...[
                    { label: 'User management', icon: 'pi pi-fw pi-user', to: '/users', requiredPermissions: [Permissions.LIST_ALL_USERS] },
                    { label: 'Manage roles and permissions', icon: 'pi pi-fw pi-circle', to: '/role-permissions', requiredPermissions: [Permissions.LIST_ALL_ROLES, Permissions.LIST_ALL_PERMISSIONS] }
                ].filter(item => !item.requiredPermissions || hasPermission(item.requiredPermissions))
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
