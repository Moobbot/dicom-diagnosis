'use client';
import React, { useEffect, useReducer, useCallback, useMemo } from 'react';

import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

import RoleService from '@/modules/admin/service/RoleService';
import PermissionService from '@/modules/admin/service/PermissionService';
import '@/modules/admin/styles/RolePermissionTable.scss';

import { Base } from '@/types';
import { withPermissions } from '../withPermissions';
import { Permissions } from '@/enums/permissions.enums';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import GenericButton from '@/layout/components/GenericButton';

interface State {
    roles: Base.Role[];
    permissions: Base.Permission[];
    filteredPermissions: Base.Permission[];
    selectedPermissions: Base.Permissions;
    searchQuery: string;
    isSaved: boolean;
    newPermissionName: string;
    newRoleName: string;
    permissionDialog: boolean;
    roleDialog: boolean;
    showInactiveRoles: boolean;
}

type Action = 
    | { type: 'SET_ROLES'; payload: Base.Role[] }
    | { type: 'SET_PERMISSIONS'; payload: Base.Permission[] }
    | { type: 'SET_FILTERED_PERMISSIONS'; payload: Base.Permission[] }
    | { type: 'SET_SELECTED_PERMISSIONS'; payload: Base.Permissions }
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_IS_SAVED'; payload: boolean }
    | { type: 'SET_NEW_PERMISSION_NAME'; payload: string }
    | { type: 'SET_NEW_ROLE_NAME'; payload: string }
    | { type: 'SET_PERMISSION_DIALOG'; payload: boolean }
    | { type: 'SET_ROLE_DIALOG'; payload: boolean }
    | { type: 'SET_SHOW_INACTIVE_ROLES'; payload: boolean }
    | { type: 'UPDATE_ROLE_PERMISSIONS'; payload: { roleId: string; permissionId: string } };

const initialState: State = {
    roles: [],
    permissions: [],
    filteredPermissions: [],
    selectedPermissions: {},
    searchQuery: '',
    isSaved: false,
    newPermissionName: '',
    newRoleName: '',
    permissionDialog: false,
    roleDialog: false,
    showInactiveRoles: false
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'SET_ROLES':
            return { ...state, roles: action.payload };
        case 'SET_PERMISSIONS':
            return { ...state, permissions: action.payload };
        case 'SET_FILTERED_PERMISSIONS':
            return { ...state, filteredPermissions: action.payload };
        case 'SET_SELECTED_PERMISSIONS':
            return { ...state, selectedPermissions: action.payload };
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'SET_IS_SAVED':
            return { ...state, isSaved: action.payload };
        case 'SET_NEW_PERMISSION_NAME':
            return { ...state, newPermissionName: action.payload };
        case 'SET_NEW_ROLE_NAME':
            return { ...state, newRoleName: action.payload };
        case 'SET_PERMISSION_DIALOG':
            return { ...state, permissionDialog: action.payload };
        case 'SET_ROLE_DIALOG':
            return { ...state, roleDialog: action.payload };
        case 'SET_SHOW_INACTIVE_ROLES':
            return { ...state, showInactiveRoles: action.payload };
        case 'UPDATE_ROLE_PERMISSIONS':
            const { roleId, permissionId } = action.payload;
            const updatedRoles = state.roles.map(role => {
                if (role._id === roleId) {
                    const currentPermissions = Array.isArray(role.permissions) ? role.permissions : [];
                    return {
                        ...role,
                        permissions: currentPermissions.includes(permissionId) 
                            ? currentPermissions.filter(p => p !== permissionId) 
                            : [...currentPermissions, permissionId],
                        grant_all: false
                    };
                }
                return role;
            });
            return { ...state, roles: updatedRoles };
        default:
            return state;
    }
};

const RolePermissionTable = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const toast = React.useRef<Toast>(null);
    const breadcrumbHome = { icon: 'pi pi-home', to: '/' };
    const breadcrumbItems = [{ label: 'Quản lý vai trò' }];
    const roleService = new RoleService();
    const permissionService = new PermissionService();
    const isInitialMount = React.useRef(true);
    const lastFetchTime = React.useRef(0);
    const FETCH_INTERVAL = 5000; // 5 giây

    const showToast = useCallback((severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail });
        }
    }, []);

    const isAdminRole = useCallback((role: Base.Role) => {
        return role.name === 'Admin';
    }, []);

    const isLockedRole = useCallback((role: Base.Role) => {
        return role.status === false;
    }, []);

    const handlePermissionChange = useCallback((roleId: string, permissionId: string) => {
        const role = state.roles.find((r) => r._id === roleId);

        if (role && (isAdminRole(role) || isLockedRole(role))) {
            showToast('warn', 'Không được phép', `Không thể thay đổi quyền của ${isAdminRole(role) ? 'Admin' : 'vai trò đã bị khóa'}`);
            return;
        }

        dispatch({ type: 'UPDATE_ROLE_PERMISSIONS', payload: { roleId, permissionId } });
        dispatch({ 
            type: 'SET_SELECTED_PERMISSIONS', 
            payload: {
                ...state.selectedPermissions,
                [`${roleId}-${permissionId}`]: !state.selectedPermissions[`${roleId}-${permissionId}`]
            }
        });
    }, [state.roles, state.selectedPermissions, isAdminRole, isLockedRole, showToast]);

    const hideDialog = useCallback(() => {
        dispatch({ type: 'SET_PERMISSION_DIALOG', payload: false });
        dispatch({ type: 'SET_ROLE_DIALOG', payload: false });
    }, []);

    const savePermission = useCallback(async () => {
        try {
            const response = await permissionService.createPermission(state.newPermissionName);
            dispatch({ type: 'SET_PERMISSIONS', payload: [...state.permissions, response.data] });
            dispatch({ type: 'SET_FILTERED_PERMISSIONS', payload: [...state.permissions, response.data] });
            dispatch({ type: 'SET_PERMISSION_DIALOG', payload: false });
            showToast('success', 'Thành công', 'Quyền đã được tạo');
        } catch (error) {
            showToast('error', 'Lỗi', 'Không thể tạo quyền');
        }
    }, [state.newPermissionName, state.permissions, showToast]);

    const fetchRoles = useCallback(async () => {
        try {
            const response = await roleService.getRoles(1, 30);
            const rolesData = response.data
                .filter((role: any) => (state.showInactiveRoles ? true : role.status !== false))
                .map((role: any) => {
                    const rolePermissions = role.grant_all ? state.permissions.map((p) => p.name) : role.permissions;
                    return { ...role, permissions: rolePermissions };
                });
            dispatch({ type: 'SET_ROLES', payload: rolesData });
        } catch (error: any) {
            showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể lấy danh sách vai trò');
        }
    }, [state.showInactiveRoles, state.permissions, showToast]);

    const fetchPermissions = useCallback(async () => {
        try {
            const permissionsData = await permissionService.getPermissions();
            dispatch({ type: 'SET_PERMISSIONS', payload: permissionsData });
            dispatch({ type: 'SET_FILTERED_PERMISSIONS', payload: permissionsData });
            // Sau khi có permissions, fetch lại roles để cập nhật permissions
            await fetchRoles();
        } catch (error: any) {
            showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể lấy danh sách quyền');
        }
    }, [showToast, fetchRoles]);

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        fetchPermissions();
    }, []);

    // Fetch roles khi showInactiveRoles thay đổi
    useEffect(() => {
        if (state.permissions.length > 0) {
            fetchRoles();
        }
    }, [state.showInactiveRoles]);

    // Tối ưu hóa việc lọc quyền
    const filteredPermissions = useMemo(() => {
        if (state.searchQuery.trim() === '') {
            return state.permissions;
        }
        return state.permissions.filter((permission) => 
            permission.description && 
            permission.description.toLowerCase().includes(state.searchQuery.toLowerCase())
        );
    }, [state.searchQuery, state.permissions]);

    // Cập nhật filteredPermissions khi có thay đổi
    useEffect(() => {
        dispatch({ type: 'SET_FILTERED_PERMISSIONS', payload: filteredPermissions });
    }, [filteredPermissions]);

    // Tối ưu hóa việc khởi tạo quyền đã chọn
    const initializeSelectedPermissions = useCallback(() => {
        if (state.roles.length === 0 || state.permissions.length === 0) return;

        const initialSelectedPermissions: Base.Permissions = {};
        state.roles.forEach((role) => {
            if (role && role._id) {
                const rolePermissions = role.permissions || [];
                state.permissions.forEach((permission) => {
                    const key = `${role._id}-${permission._id}`;
                    initialSelectedPermissions[key] = role.grant_all || 
                        (Array.isArray(rolePermissions) && rolePermissions.includes(permission._id));
                });
            }
        });
        dispatch({ type: 'SET_SELECTED_PERMISSIONS', payload: initialSelectedPermissions });
    }, [state.roles, state.permissions]);

    useEffect(() => {
        initializeSelectedPermissions();
    }, [initializeSelectedPermissions]);

    const onEditRole = useCallback((role: Base.Role) => {
        if (isAdminRole(role)) {
            showToast('warn', 'Không được phép', 'Không thể chỉnh sửa vai trò Admin');
            return;
        }
        showToast('info', 'Edit Role', `Editing role ${role.name}`);
    }, [isAdminRole, showToast]);

    const onLockRole = useCallback((role: Base.Role) => {
        if (isAdminRole(role)) {
            showToast('warn', 'Không được phép', 'Không thể khóa vai trò Admin');
            return;
        }

        confirmDialog({
            message: `Bạn có chắc chắn muốn khóa vai trò "${role.name}"?`,
            header: 'Xác nhận khóa vai trò',
            icon: 'pi pi-lock',
            accept: async () => {
                try {
                    await roleService.changeRoleStatus(role._id, false);
                    await fetchRoles();
                    showToast('success', 'Vai trò đã bị khóa', `Vai trò "${role.name}" đã bị khóa thành công`);
                } catch (error) {
                    showToast('error', 'Lỗi', 'Không thể khóa vai trò');
                }
            }
        });
    }, [isAdminRole, fetchRoles, showToast]);

    const onUnlockRole = useCallback((role: Base.Role) => {
        confirmDialog({
            message: `Bạn có chắc chắn muốn mở khóa vai trò "${role.name}"?`,
            header: 'Xác nhận mở khóa vai trò',
            icon: 'pi pi-unlock',
            accept: async () => {
                try {
                    await roleService.changeRoleStatus(role._id, true);
                    await fetchRoles();
                    showToast('success', 'Vai trò đã được mở khóa', `Vai trò "${role.name}" đã được mở khóa thành công`);
                } catch (error) {
                    showToast('error', 'Lỗi', 'Không thể mở khóa vai trò');
                }
            }
        });
    }, [fetchRoles, showToast]);

    const renderCheckbox = useCallback((permission: any, role: Base.Role) => {
        const isDisabled = isAdminRole(role) || isLockedRole(role);
        return <Checkbox 
            checked={!!state.selectedPermissions[`${role._id}-${permission._id}`]} 
            onChange={() => handlePermissionChange(role._id, permission._id)} 
            disabled={isDisabled} 
        />;
    }, [state.selectedPermissions, handlePermissionChange, isAdminRole, isLockedRole]);

    const renderRoleHeader = useCallback((role: Base.Role) => {
        const isAdmin = isAdminRole(role);
        const isLocked = isLockedRole(role);

        return (
            <div className="role-header-container flex flex-column align-items-center">
                <span className={`role-name ${isLocked ? 'locked-role' : ''}`}>
                    {role.name} {isLocked && <i className="pi pi-lock" style={{ marginLeft: '5px', color: 'red' }}></i>}
                </span>
                {!isAdmin && (
                    <div className="role-actions">
                        <GenericButton 
                            icon="pi pi-pencil" 
                            className="p-button-rounded p-button-text p-button-secondary" 
                            onClick={() => onEditRole(role)} 
                        />
                        {isLocked ? 
                            <GenericButton icon="pi pi-unlock" onClick={() => onUnlockRole(role)} /> : 
                            <GenericButton 
                                icon="pi pi-lock" 
                                className="p-button-rounded p-button-text p-button-warning" 
                                onClick={() => onLockRole(role)} 
                            />
                        }
                    </div>
                )}
            </div>
        );
    }, [isAdminRole, isLockedRole, onEditRole, onLockRole, onUnlockRole]);

    // Tối ưu hóa việc render danh sách vai trò
    const roleColumns = useMemo(() => 
        state.roles.map((role) => (
            <Column 
                key={role._id} 
                header={renderRoleHeader(role)} 
                body={(permission) => renderCheckbox(permission, role)} 
            />
        )), 
        [state.roles, renderRoleHeader, renderCheckbox]
    );

    const saveChanges = useCallback(async () => {
        try {
            for (const role of state.roles) {
                if (isAdminRole(role) || isLockedRole(role)) continue;

                const updatedData: { name?: string; permissions?: string[]; grant_all?: boolean } = {};
                if (role.name) updatedData.name = role.name;
                if (role.permissions) updatedData.permissions = role.permissions;
                if (role.grant_all !== undefined) updatedData.grant_all = role.grant_all;

                await roleService.updateRole(role._id, updatedData);
            }
            showToast('success', 'Success', 'Changes saved successfully');
        } catch (error) {
            showToast('error', 'Error', 'Failed to save changes');
        }
    }, [state.roles, isAdminRole, isLockedRole, showToast]);

    const openNewPermissionDialog = useCallback(() => {
        dispatch({ type: 'SET_NEW_PERMISSION_NAME', payload: '' });
        dispatch({ type: 'SET_PERMISSION_DIALOG', payload: true });
    }, []);

    const openNewRoleDialog = useCallback(() => {
        dispatch({ type: 'SET_NEW_ROLE_NAME', payload: '' });
        dispatch({ type: 'SET_ROLE_DIALOG', payload: true });
    }, []);

    const saveRole = useCallback(async () => {
        try {
            const response = await roleService.createRole(state.newRoleName);
            const createdRole = response.data;
            await fetchRoles();
            dispatch({ type: 'SET_ROLE_DIALOG', payload: false });
            showToast('success', 'Thành công', `Vai trò "${createdRole.name}" đã được tạo thành công.`);
        } catch (error) {
            showToast('error', 'Lỗi', 'Không thể tạo vai trò.');
        }
    }, [state.newRoleName, fetchRoles, showToast]);

    return (
        <div className="layout-main">
            <div className="col-12">
                <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />
                <div className="card role-permission-table">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div className="pi pi-users" style={{ fontSize: '2rem' }}></div>
                        <span style={{ fontSize: '2rem', fontWeight: '600', color: 'black' }}>Quản lý vai trò và quyền</span>
                    </div>
                    <Toast ref={toast} />
                    <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className="p-input-icon-left search-container" style={{ width: '30%' }}>
                            <i className="pi pi-search" />
                            <InputText 
                                placeholder="Tìm kiếm theo mô tả quyền" 
                                value={state.searchQuery} 
                                onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })} 
                                className="search-input" 
                                style={{ width: '100%' }} 
                            />
                        </div>

                        <div className="flex align-items-center">
                            <Checkbox 
                                inputId="showInactive" 
                                checked={state.showInactiveRoles} 
                                onChange={(e) => dispatch({ type: 'SET_SHOW_INACTIVE_ROLES', payload: e.checked as boolean })} 
                                className="mr-2" 
                            />
                            <label htmlFor="showInactive" className="mr-4">
                                Hiển thị vai trò đã khóa
                            </label>
                            <GenericButton 
                                label="Thêm vai trò" 
                                icon="pi pi-plus" 
                                className="p-button-primary" 
                                onClick={openNewRoleDialog} 
                            />
                        </div>
                    </div>

                    <DataTable value={state.filteredPermissions} className="p-datatable-sm">
                        <Column field="name" header="Tên quyền" />
                        <Column field="description" header="Mô tả quyền" />
                        {roleColumns}
                    </DataTable>

                    <div className="save-button-container" style={{ marginTop: '1rem' }}>
                        <GenericButton 
                            label="Lưu" 
                            className={`${state.isSaved ? 'p-button-success' : 'p-button-primary'} p-mt-3`} 
                            onClick={saveChanges} 
                        />
                    </div>
                    <ConfirmDialog />

                    <Dialog
                        visible={state.roleDialog}
                        style={{ width: '450px' }}
                        header="Thêm vai trò"
                        modal
                        className="p-fluid"
                        footer={
                            <>
                                <GenericButton 
                                    label="Hủy" 
                                    icon="pi pi-times" 
                                    className="p-button" 
                                    onClick={hideDialog} 
                                    severity="danger"
                                />
                                <GenericButton 
                                    label="Lưu" 
                                    icon="pi pi-check" 
                                    className="p-button" 
                                    onClick={saveRole} 
                                    severity="success"
                                />
                            </>
                        }
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="roleName">Tên vai trò</label>
                            <InputText 
                                id="roleName"
                                value={state.newRoleName} 
                                onChange={(e) => dispatch({ type: 'SET_NEW_ROLE_NAME', payload: e.target.value })} 
                                required 
                                autoFocus 
                            />
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withPermissions(RolePermissionTable, [Permissions.LIST_ALL_ROLES, Permissions.LIST_ALL_PERMISSIONS]);