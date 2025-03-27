'use client';

import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { BreadCrumb } from 'primereact/breadcrumb';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Paginator } from 'primereact/paginator';
import { FiUsers } from 'react-icons/fi';
import UserService from '@/modules/admin/service/UserService';
import RoleService from '@/modules/admin/service/RoleService';
import { Base } from '@/types';
import GenericButton from '@/layout/components/GenericButton';
import { DataTable } from 'primereact/datatable';

// Import components
import UserDialog from '@/modules/users/components/UserDialog';
import UserDetailDialog from '@/modules/users/components/UserDetailDialog';
import DeleteDialog from '@/modules/users/components/DeleteDialog';
import UserTable from '@/modules/users/components/UserTable';
import { Gender } from '@/enums/gender.enum';
import { Permissions } from '@/enums/permissions.enums';
import { withPermissions } from '../withPermissions';

const Crud = () => {
    let emptyUser: Base.User = {
        _id: '',
        username: '',
        password: '',
        roles: [],
        createdBy: null,
        updatedBy: null,
        createdAt: '',
        updatedAt: '',
        status: true,
        detail_user: {
            user_code: '',
            name: '',
            avatar: '',
            dob: '',
            address: '',
            gender: Gender.OTHER
        }
    };

    const [users, setUsers] = useState<Base.User[] | null>(null);
    const [userDialog, setUserDialog] = useState(false);
    const [roles, setRoles] = useState<{ label: string; value: Base.Role }[]>([]);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [deleteUsersDialog, setDeleteUsersDialog] = useState(false);
    const [user, setUser] = useState<Base.User>(emptyUser);
    const [selectedUsers, setSelectedUsers] = useState<Base.User[] | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string | null>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [rows, setRows] = useState(10);
    const [page, setPage] = useState(1);
    const [filters1, setFilters1] = useState({});
    const [selectedUser, setSelectedUser] = useState<Base.User | null>(null);
    const [detailDialog, setDetailDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const toast = useRef<Toast>(null);
    const userService = new UserService();
    const roleService = new RoleService();
    const breadcrumbHome = { icon: 'pi pi-home', to: '/' };
    const breadcrumbItems = [{ label: 'Manage users' }];

    const dt = useRef<DataTable<any>>(null);

    const fetchUsers = async (page: number, rows: number) => {
        try {
            setLoading(true);
            const response = await userService.getUsers(page, rows);
            setUsers(response.data);
            setTotalRecords(response.total);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Cannot get users!' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page, rows);
    }, [page, rows]);

    const fetchRoles = async () => {
        try {
            const response = await roleService.getRoles(1, 30);
            const roleOptions = response.data
                .filter((role: any) => role.status === true)
                .map((role: any) => ({
                    label: role.name,
                    value: {
                        _id: role._id,
                        name: role.name,
                        status: role.status,
                        permissions: role.permissions || [],
                        grant_all: role.grant_all || false
                    } as Base.Role
                }));
            setRoles(roleOptions);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Cannot get roles!' });
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const openNew = () => {
        setUser(emptyUser);
        setSubmitted(false);
        setUserDialog(true);
        setIsEditing(false);
        setPreview(null);
        setSelectedFile(null);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setUserDialog(false);
        setPreview(null);
        setSelectedFile(null);
    };

    const hideDeleteUserDialog = () => {
        setDeleteUserDialog(false);
    };

    const hideDeleteUsersDialog = () => {
        setDeleteUsersDialog(false);
    };

    const saveUser = async () => {
        setSubmitted(true);

        if (user.username.trim()) {
            try {
                if (user._id) {
                    // Update user
                    const updateData: { name: string; roles: string[]; password?: string; user_code?: string } = {
                        name: user.detail_user.name,
                        roles: user.roles.map((role) => role._id),
                        user_code: user.detail_user.user_code
                    };

                    if (user.password && user.password.trim() !== '') {
                        updateData.password = user.password;
                    }

                    await userService.updateUser(user._id.toString(), updateData);
                    toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User has been updated!', life: 3000 });
                } else {
                    // Create new user
                    if (!user.detail_user.user_code || !user.detail_user.name) {
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Please fill in all required information!'
                        });
                        return;
                    }

                    await userService.createUser({
                        username: user.username,
                        password: user.password,
                        roles: user.roles,
                        detail_user: {
                            user_code: user.detail_user.user_code,
                            name: user.detail_user.name,
                            dob: user.detail_user.dob || '',
                            address: user.detail_user.address || '',
                            gender: user.detail_user.gender || Gender.OTHER,
                            avatar: user.detail_user.avatar || ''
                        }
                    });
                    toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User has been created successfully!', life: 3000 });
                }

                setUserDialog(false);
                setUser(emptyUser);
                setPreview(null);
                setSelectedFile(null);
                fetchUsers(page, rows);
            } catch (error: any) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message || 'Cannot save user!'
                });
            }
        }
    };

    const editUser = (user: Base.User) => {
        const userRolesForMultiSelect = user.roles.map((role) => {
            const matchingRole = roles.find((r) => r.value._id === role._id);
            if (matchingRole) {
                return matchingRole.value;
            } else {
                return {
                    _id: role._id,
                    name: role.name,
                    status: role.status || true,
                    permissions: role.permissions || [],
                    grant_all: role.grant_all || false
                } as Base.Role;
            }
        });

        setUser({
            ...user,
            roles: userRolesForMultiSelect
        });
        setUserDialog(true);
        setIsEditing(true);
        setPreview(null);
        setSelectedFile(null);
    };

    const confirmDeleteUser = (user: Base.User) => {
        setUser(user);
        setDeleteUserDialog(true);
    };

    const changeUserStatus = async () => {
        try {
            const newStatus = !user.status;
            await userService.changeUserStatus(user._id.toString(), newStatus);
            setDeleteUserDialog(false);
            setUser(emptyUser);
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: `User ${newStatus ? 'has been activated' : 'has been locked'} successfully!`,
                life: 3000
            });
            await fetchUsers(page, rows);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Cannot update user status!'
            });
        }
    };

    const confirmDeleteSelected = async () => {
        if (selectedUsers && selectedUsers.length > 0) {
            try {
                await Promise.all(
                    selectedUsers.map(async (user) => {
                        const newStatus = !user.status;
                        await userService.changeUserStatus(user._id.toString(), newStatus);
                    })
                );
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User status has been updated!', life: 3000 });
                await fetchUsers(page, rows);
            } catch (error: any) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message || 'Cannot update user status!' });
            }
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _user = { ...user };

        if (name.startsWith('detail_user.')) {
            const detailUserField = name.split('.')[1];
            _user.detail_user = {
                ..._user.detail_user,
                [detailUserField]: val
            };
        } else {
            (_user as any)[name] = val;
        }

        setUser(_user);
    };

    const onMultiSelectChange = (e: { value: Base.Role[] }, name: string) => {
        const val = e.value;
        let _user = { ...user };
        (_user as any)[name] = val;
        setUser(_user);
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setGlobalFilter(value);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreview(base64String);

                // Cập nhật đối tượng user với avatar mới
                let _user = { ...user };
                _user.detail_user = {
                    ..._user.detail_user,
                    avatar: base64String
                };
                setUser(_user);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePageChange = (event: any) => {
        const currentPage = Math.floor(event.first / event.rows) + 1;
        setPage(currentPage);
        setRows(event.rows);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="table-header flex align-items-center">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="text" placeholder="Search..." value={globalFilter || ''} onChange={onGlobalFilterChange} />
                </span>
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex flex-wrap" style={{ gap: '8px' }}>
                    <GenericButton label="Add account" icon="pi pi-plus" onClick={openNew} permissions={[Permissions.ADD_USER]} style={{ height: '40px' }} severity="info" />
                    <GenericButton
                        label="Lock account"
                        icon="pi pi-lock"
                        onClick={confirmDeleteSelected}
                        permissions={[Permissions.CHANGE_STATUS_USER]}
                        disabled={!selectedUsers || !selectedUsers.length}
                        style={{ height: '40px' }}
                        severity="danger"
                    />
                    <GenericButton label="Export data" icon="pi pi-upload" onClick={exportCSV} severity="help" />
                </div>
            </React.Fragment>
        );
    };

    return (
        <>
            <div className="layout-main">
                <div className="col-12">
                    <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />
                    <div className="card">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiUsers size={50} />
                            <h1>Manage accounts</h1>
                        </Box>

                        <Toast ref={toast} />
                        <Toolbar start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

                        <UserTable
                            ref={dt}
                            users={users}
                            selectedUsers={selectedUsers}
                            onSelectionChange={(e) => setSelectedUsers(e.value as Base.User[])}
                            onEdit={editUser}
                            onDelete={confirmDeleteUser}
                            loading={loading}
                            filters={filters1}
                            globalFilter={globalFilter}
                            dataKey="_id"
                            rows={rows}
                            rowsPerPageOptions={[5, 10, 25]}
                            showGridlines={true}
                            scrollable={true}
                            removableSort={true}
                        />

                        <Paginator first={(page - 1) * rows} rows={rows} totalRecords={totalRecords} rowsPerPageOptions={[5, 10, 15]} onPageChange={handlePageChange} />
                    </div>

                    <UserDialog
                        visible={userDialog}
                        onHide={hideDialog}
                        user={user}
                        isEditing={isEditing}
                        submitted={submitted}
                        roles={roles}
                        preview={preview}
                        onInputChange={onInputChange}
                        onMultiSelectChange={onMultiSelectChange}
                        onFileChange={handleFileChange}
                        onSave={saveUser}
                    />

                    <UserDetailDialog visible={detailDialog} onHide={() => setDetailDialog(false)} selectedUser={selectedUser} />

                    <DeleteDialog visible={deleteUserDialog} onHide={hideDeleteUserDialog} user={user} onConfirm={changeUserStatus} />
                </div>
            </div>
            <style jsx global>{`
                .p-paginator {
                    justify-content: flex-end !important;
                }
                .p-datatable-wrapper {
                    margin-bottom: 0.5rem;
                }
                .p-column-header-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .p-dropdown-label {
                    padding-right: 2rem !important;
                }
                .p-input-icon-left input {
                    width: 100%;
                }
                .role-badge {
                    background-color: #eef2ff;
                    color: #4f46e5;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    margin: 2px;
                    display: inline-block;
                }
            `}</style>
        </>
    );
};

export default withPermissions(Crud, [Permissions.LIST_ALL_USERS, Permissions.LIST_ALL_ROLES]);
