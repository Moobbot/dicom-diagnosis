'use client';
import React, { useEffect, useState } from 'react';

import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

import RoleService from '../../../modules/admin/service/RoleService';
import PermissionService from '../../../modules/admin/service/PermissionService';
import '../../../modules/admin/styles/RolePermissionTable.scss';

import { Base } from '@/types';
import { withPermissions } from '../withPermissions';
import { Permissions } from '@/enums/permissions.enums';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const RolePermissionTable = () => {
    const [roles, setRoles] = useState<Base.Role[]>([]);
    const [permissions, setPermissions] = useState<Base.Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Base.Permissions>({});
    const toast = React.useRef<Toast>(null);
    const [isSaved, setIsSaved] = useState(false);
    const breadcrumbHome = { icon: 'pi pi-home', to: '/' };
    const breadcrumbItems = [{ label: 'Quản lý vai trò' },];
    const roleService = new RoleService();
    const permissionService = new PermissionService();
    const [newPermissionName, setNewPermissionName] = useState('');
    const [newRoleName, setNewRoleName] = useState('');
    const [permissionDialog, setPermissionDialog] = useState(false);
    const [roleDialog, setRoleDialog] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await roleService.getRoles(1, 30);
                const rolesData = response.data
                    .filter((role: any) => role.status !== false)
                    .map((role: any) => {
                    const rolePermissions = role.grantAll ? permissions.map(p => p.name) : role.permissions;
                    return { ...role, permissions: rolePermissions };
                });
                setRoles(rolesData);
            } catch (error) {
                if (toast.current) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch roles' });
                }
            }
        };

        const fetchPermissions = async () => {
            try {
                const response = await permissionService.getPermissions(1, 30);
                setPermissions(response.permissions);
            } catch (error) {
                if (toast.current) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch permissions' });
                }
            }
        };

        fetchRoles();
        fetchPermissions();
    }, []);

    useEffect(() => {
        const initializeSelectedPermissions = () => {
            const initialSelectedPermissions: Base.Permissions = {};
            roles.forEach(role => {
                if (role && role._id && role.permissions && Array.isArray(role.permissions)) {
                    permissions.forEach(permission => {
                        const key = `${role._id}-${permission._id}`;
                        initialSelectedPermissions[key] = role.grantAll || role.permissions.includes(permission._id);
                    });
                } else {
                    console.error(`Permissions for role ${role?._id ?? 'undefined'} are not defined or not an array`);
                }
            });
            setSelectedPermissions(initialSelectedPermissions);
        };
    
        initializeSelectedPermissions();
    }, [roles, permissions]);
    
    const handlePermissionChange = (roleId: string, permissionId: string) => {
        setRoles(prevRoles =>
            prevRoles.map(role =>
                role._id === roleId
                    ? {
                          ...role,
                          permissions: role.permissions.includes(permissionId)
                              ? role.permissions.filter((p: string) => p !== permissionId)
                              : [...role.permissions, permissionId],
                          grantAll: false // Khi thay đổi quyền, grantAll sẽ được đặt thành false
                      }
                    : role
            )
        );
    
        setSelectedPermissions((prevSelectedPermissions: Base.Permissions) => {
            const newSelectedPermissions = { ...prevSelectedPermissions };
            const key = `${roleId}-${permissionId}`;
            newSelectedPermissions[key] = !prevSelectedPermissions[key];
            return newSelectedPermissions;
        });
    };

    const hideDialog = () => {
        setPermissionDialog(false);
        setRoleDialog(false);
    };

    const savePermission = async () => {
        try {
            const response = await permissionService.createPermission(newPermissionName);
            setPermissions([...permissions, response.data]);
            setPermissionDialog(false);
            showToast('success', 'Successful', 'Permission Created');
        } catch (error) {
            showToast('error', 'Error', 'Failed to create permission');
        }
    };
    
const saveRole = async () => {
    try {
        const response = await roleService.createRole(newRoleName);
        const createdRole = response.data;

        // Lấy danh sách vai trò mới nhất
        const updatedRolesResponse = await roleService.getRoles(1, 30);
        const updatedRoles = updatedRolesResponse.data
            .filter((role: { status: boolean; }) => role.status !== false)
            .map((role: { grantAll: any; permissions: any; }) => ({
                ...role,
                permissions: role.grantAll ? permissions.map(p => p.name) : role.permissions,
            }));

        // Cập nhật danh sách vai trò
        setRoles(updatedRoles);

        setRoleDialog(false);
        showToast('success', 'Successful', `Role "${createdRole.name}" created and updated successfully.`);
    } catch (error) {
        showToast('error', 'Error', 'Failed to create or update role.');
    }
};

    const openNewPermissionDialog = () => {
        setNewPermissionName('');
        setPermissionDialog(true);
    };
    
    const openNewRoleDialog = () => {
        setNewRoleName('');
        setRoleDialog(true);
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail });
        }
    };

    const onEditRole = (roleName: string) => {
        showToast('info', 'Edit Role', `Editing role ${roleName}`);
    };

    const onDeleteRole = (roleId: string) => {
        confirmDialog({
            message: `Are you sure you want to deactivate the role?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const response = await roleService.changeRoleStatus(roleId, false);
                    setRoles(roles.filter(role => role._id !== roleId));
                    showToast('warn', 'Role Deactivated', `Role ${response.data.name} deactivated successfully`);
                } catch (error) {
                    showToast('error', 'Error', 'Failed to deactivate role');
                }
            },
        });
    };

    const onEditPermission = (permissionName: string) => {
        showToast('info', 'Edit Permission', `Editing permission ${permissionName}`);
    };

    const onDeletePermission = (permissionName: string) => {
        confirmDialog({
            message: `Are you sure you want to delete the permission ${permissionName}?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => showToast('warn', 'Delete Permission', `Permission ${permissionName} deleted`),
        });
    };

    const handleSaveClick = () => {
        confirmDialog({
            message: 'Do you want to save the changes?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => setIsSaved(true),
        });
    };

    const saveChanges = async () => {
        try {
            for (const role of roles) {
                const updatedData: { name?: string; permissions?: string[]; grantAll?: boolean } = {};
                if (role.name) updatedData.name = role.name;
                if (role.permissions) updatedData.permissions = role.permissions;
                if (role.grantAll !== undefined) updatedData.grantAll = role.grantAll;
    
                await roleService.updateRole(role._id, updatedData);
            }
            if (toast.current) {
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Changes saved successfully' });
            }
        } catch (error) {
            if (toast.current) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save changes' });
            }
        }
    };

    return (
        <div className="layout-main">
            <div className="col-12">
                <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />
                <div className="role-permission-table">
                    <Toast ref={toast} />
                    <div className="button-container">
                        <Button label="Thêm quyền" icon="pi pi-plus" className="p-button-primary" onClick={openNewPermissionDialog} />
                        <Button label="Thêm vai trò" icon="pi pi-plus" className="p-button-primary" onClick={openNewRoleDialog} />
                    </div>

                    {/* Sử dụng DataTable */}
                    <DataTable value={permissions} className="p-datatable-sm">
                        {/* Cột quyền */}
                        <Column field="name" header="Tên quyền" />

                        {/* Các cột vai trò */}
                        {roles.map((role) => (
                            <Column
                                key={role._id}
                                header={
                                    <>
                                        {role.name}
                                        <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-secondary" onClick={() => onEditRole(role.name)} />
                                        <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-secondary" onClick={() => onDeleteRole(role._id)} />
                                    </>
                                }
                                body={(permission) => (
                                    <Checkbox
                                        checked={!!selectedPermissions[`${role._id}-${permission._id}`]}
                                        onChange={() => handlePermissionChange(role._id, permission._id)}
                                    />
                                )}
                            />
                        ))}
                    </DataTable>

                    <div className="save-button-container">
                        <Button
                            label="Lưu"
                            className={`${isSaved ? 'p-button-success' : 'p-button-primary'} p-mt-3`}
                            onClick={saveChanges}
                        />
                    </div>
                    <ConfirmDialog />
                    {/* Các dialog vẫn giữ nguyên */}
                </div>
            </div>
        </div>
    );
};

export default withPermissions(RolePermissionTable, [Permissions.LIST_ALL_ROLES, Permissions.LIST_ALL_PERMISSIONS]);