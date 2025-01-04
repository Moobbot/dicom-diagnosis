/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';
import RBAC from '@/app/api/RBAC';
import { Permissions } from '@/enums/permissions.enums';

const AppMenu = () => {
    // Lấy danh sách quyền của người dùng
    let permissions = RBAC();

    const { layoutConfig } = useContext(LayoutContext);

    // Xây dựng danh sách menu
    const model: AppMenuItem[] = [
        {
            label: 'HOME',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
                ...(permissions.includes(Permissions.LIST_ALL_PERMISSIONS)
                    ? [
                        { label: 'Nhật kí hoạt động', icon: 'pi pi-fw pi-circle', to: '/logs' }
                    ]
                    : []),
                ...(permissions.includes(Permissions.LIST_ALL_USERS) ? [{ label: 'Quản lý người dùng', icon: 'pi pi-fw pi-user', to: '/crud' }] : []),
                ...(permissions.includes(Permissions.LIST_ALL_ROLES) ? [{ label: 'Quản lý vai trò', icon: 'pi pi-fw pi-circle', to: '/permission' }] : [])
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
