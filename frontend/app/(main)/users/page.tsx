'use client';

import React, { useEffect, useRef, useState } from 'react';

// Next.js and utilities
import { format, isValid } from 'date-fns';
import Box from '@mui/material/Box';

// PrimeReact components
import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { RadioButton } from 'primereact/radiobutton';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Tooltip } from 'primereact/tooltip';
import { classNames } from 'primereact/utils';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Paginator } from 'primereact/paginator';

// Icon imports
import { FiUsers } from 'react-icons/fi';
import { FaEye, FaPencilAlt, FaUserLock } from 'react-icons/fa';

// Services and API
import UserService from '../../../modules/admin/service/UserService';
import RoleService from '../../../modules/admin/service/RoleService';

// Types and enums
import { Base } from '@/types';

// Custom components
import GenericButton from '@/layout/components/GenericButton';
import DeleteButton from '@/layout/components/DeleteButton';
import NewButton from '@/layout/components/NewButton';
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
            birth_date: '',
            address: '',
            gender: 3
        }
    };

    const [users, setUsers] = useState<Base.User[] | null>(null);
    const [userDialog, setUserDialog] = useState(false);
    const [roles, setRoles] = useState<{ label: string; value: { _id: string; name: string } }[]>([]);
    const [deleteUserDialog, setDeleteUserDialog] = useState(false);
    const [deleteUsersDialog, setDeleteUsersDialog] = useState(false);
    const [user, setUser] = useState<Base.User>(emptyUser);
    const [selectedUsers, setSelectedUsers] = useState<Base.User[] | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string | null>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [rows, setRows] = useState(10);
    const [page, setPage] = useState(1);
    const [filters1, setFilters1] = useState<DataTableFilterMeta>({});
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const userService = new UserService();
    const roleService = new RoleService();
    const breadcrumbHome = { icon: 'pi pi-home', to: '/' };
    const breadcrumbItems = [{ label: 'Quản lý người dùng' }];
    const [filteredUsers, setFilteredUsers] = useState<Base.User[] | null>(null);
    const [selectedUser, setSelectedUser] = useState<Base.User | null>(null);
    const [detailDialog, setDetailDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const fetchUsers = async (page: number, rows: number) => {
        try {
            const response = await userService.getUsers(page, rows);
            setFilteredUsers(response.data);
            setTotalRecords(response.total);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch users' });
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
                    value: { _id: role._id, name: role.name }
                }));
            setRoles(roleOptions);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch roles' });
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const openNew = () => {
        setUser(emptyUser);
        setSubmitted(false);
        setUserDialog(true);
    };
    // Đang test
    // const openEdit = () => {
    //     setUser(emptyUser);
    //     setSubmitted(false);
    //     setUserDialog(true);
    // };

    const hideDialog = () => {
        setSubmitted(false);
        setUserDialog(false);
    };

    const hideDeleteUserDialog = () => {
        setDeleteUserDialog(false);
    };

    const hideDeleteUsersDialog = () => {
        setDeleteUsersDialog(false);
    };

    const updateUser = async () => {
        setSubmitted(true);

        if (user.username.trim()) {
            try {
                const updatedUser = await userService.updateUser(user._id, {
                    password: user.password,
                    roles: user.roles.map((role: Base.Role) => role._id)
                });
                const updatedUsers = users?.map((u) => (u._id === updatedUser._id ? updatedUser : u));
                setUsers(updatedUsers || null);
                setUserDialog(false);
                setUser(emptyUser);
                toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 5000 });
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update user' });
            }
        }
    };

    const saveUser = async () => {
        setSubmitted(true);

        if (user.username.trim()) {
            let _users = [...(users || [])];
            let _user = { ...user };
            const formattedRoles = _user.roles.map((role) => role._id);
            if (_user.detail_user && _user.detail_user.birth_date) {
                _user.detail_user.birth_date = format(new Date(_user.detail_user.birth_date), 'yyyy-MM-dd');
            }

            if (user._id) {
                try {
                    const updatedUser = await userService.updateUser(_user._id.toString(), {
                        password: _user.password,
                        roles: formattedRoles
                    });
                    const index = findIndexById(user._id);
                    _users[index] = updatedUser;
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 5000 });
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update user' });
                }
            } else {
                try {
                    const createdUser = await userService.createUser(_user);
                    _users.push(createdUser);
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'User Created', life: 5000 });
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to create user' });
                }
            }

            setUsers(_users);
            setUserDialog(false);
            setUser(emptyUser);
        }
        fetchUsers(page, rows);
    };

    {
        /* const onPage = (event) => {
        setPage(event.page + 1); // Cập nhật state page khi người dùng thay đổi trang
        setRows(event.rows); // Cập nhật state rows khi người dùng thay đổi số lượng hàng mỗi trang
    }; */
    }

    const editUser = (user: Base.User) => {
        const formattedRoles = user.roles.map((role) => ({
            _id: role._id,
            name: role.name,
            status: role.status,
            permissions: role.permissions,
            grantAll: role.grantAll
        }));
        setUser({ ...user, roles: formattedRoles });
        setUserDialog(true);
    };

    const confirmDeleteUser = (user: Base.User) => {
        setUser(user);
        setDeleteUserDialog(true);
    };

    const changeUserStatus = async () => {
        try {
            await userService.changeUserStatus(user._id.toString(), false);

            setUsers((prevUsers) => prevUsers?.map((val) => (val._id === user._id ? { ...val, status: false } : val)) || []);

            setFilteredUsers((prevFilteredUsers) => prevFilteredUsers?.map((val) => (val._id === user._id ? { ...val, status: false } : val)) || []);

            setDeleteUserDialog(false);
            setUser(emptyUser);
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'User status updated',
                life: 5000
            });

            // Tải lại dữ liệu sau khi cập nhật
            await fetchUsers(page, rows);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update user status'
            });
        }
    };

    const findIndexById = (id: string) => {
        let index = -1;
        if (!users) return -1;
        for (let i = 0; i < users.length; i++) {
            if (users[i]._id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = async () => {
        if (selectedUsers && selectedUsers.length > 0) {
            try {
                const updatedUsers = await Promise.all(
                    selectedUsers.map(async (user) => {
                        await userService.changeUserStatus(user._id.toString(), false);
                        return { ...user, status: false };
                    })
                );
                setUsers((prevUsers) => prevUsers?.map((user) => updatedUsers.find((updatedUser) => updatedUser._id === user._id) || user) || null);
                setFilteredUsers((prevUsers) => prevUsers?.map((user) => updatedUsers.find((updatedUser) => updatedUser._id === user._id) || user) || null); // Cập nhật lại filteredUsers
                toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Users status updated', life: 5000 });
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update users status' });
            }
        }
    };

    const deleteSelectedUsers = async () => {
        let _users = users?.filter((val) => !selectedUsers?.includes(val));
        setUsers(_users || null);
        setDeleteUsersDialog(false);
        setSelectedUsers(null);
        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Users Deleted', life: 5000 });
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

    const initFilters1 = () => {
        setFilters1({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            id: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
            },
            representative: { value: null, matchMode: FilterMatchMode.IN },
            date: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }]
            },
            balance: {
                operator: FilterOperator.AND,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
            },
            status: {
                operator: FilterOperator.OR,
                constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
            },
            activity: { value: null, matchMode: FilterMatchMode.BETWEEN }
        });
        setGlobalFilter('');
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="table-header">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="text" placeholder="Search..." />
                </span>
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <NewButton permissions={[Permissions.ADD_USER]} onClick={openNew} label="New" />
                    <DeleteButton permissions={[Permissions.CHANGE_STATUS_USER]} onClick={confirmDeleteSelected} selected={selectedUsers || []} label="Lock" />
                    <GenericButton label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
                </div>
            </React.Fragment>
        );
    };

    const userDialogFooter = (
        <React.Fragment>
            <GenericButton label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <GenericButton label="Save" icon="pi pi-check" className="p-button-text" onClick={saveUser} />
        </React.Fragment>
    );

    const deleteUserDialogFooter = (
        <React.Fragment>
            <GenericButton label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteUserDialog} />
            <GenericButton label="Yes" icon="pi pi-check" className="p-button-text" onClick={changeUserStatus} />
        </React.Fragment>
    );

    const deleteUsersDialogFooter = (
        <React.Fragment>
            <GenericButton label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteUsersDialog} />
            <GenericButton label="Yes" icon="pi pi-check" className="p-button-text" onClick={confirmDeleteSelected} />
        </React.Fragment>
    );

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setGlobalFilter(value);
        const filteredUsers = users?.filter((user) => user.detail_user.name.toLowerCase().includes(value.toLowerCase()) || user.username.toLowerCase().includes(value.toLowerCase()) || user.detail_user.user_code.toString().includes(value));
        setFilteredUsers(filteredUsers || null);
    };

    /*    const statusBodyTemplate = (rowData: Base.User) => {
            return (
                <span className={`product-badge status-${rowData.status === true ? 'instock' : 'outofstock'}`}>
                    {rowData.status === true ? 'Active' : 'Deactivated'}
                </span>
            );
        }; */

    const statusBodyTemplate = (rowData: Base.User) => {
        return (
            <div className="flex justify-content-center">
                <span
                    className={`status-badge ${rowData.status ? 'active' : 'deactivate'}`}
                    style={{
                        backgroundColor: rowData.status ? '#E7F3FF' : '#FFE7E7',
                        color: rowData.status ? '#0D6EFD' : '#DC3545',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}
                >
                    {rowData.status ? 'Active' : 'Deactivate'}
                </span>
            </div>
        );
    };

    const rolesBodyTemplate = (rowData: Base.User) => {
        return (
            <div className="flex align-items-center justify-content-center flex-wrap gap-2">
                {Array.isArray(rowData.roles) ? (
                    rowData.roles.map((role: Base.Role) => (
                        <span key={role._id} className="role-badge">
                            {role.name}
                        </span>
                    ))
                ) : (
                    <span>N/A</span>
                )}
            </div>
        );
    };

    const UpdateByBodyTemplate = (rowData: Base.User) => {
        const renderUpdatedBy = () => {
            if (Array.isArray(rowData.updatedBy)) {
                return rowData.updatedBy.map((updatedBy, index) => (
                    <span key={updatedBy._id || index} className="mr-2">
                        {updatedBy.username ?? 'Unknown'}
                    </span>
                ));
            } else if (rowData.updatedBy) {
                return <span className="mr-2">{(rowData.updatedBy as Base.User).username ?? 'Unknown'}</span>;
            }
            return 'N/A';
        };

        return <div>{renderUpdatedBy()}</div>;
    };

    const CreateByBodyTemplate = (rowData: Base.User) => {
        return (
            <div>
                {Array.isArray(rowData.createdBy) ? (
                    rowData.createdBy.map((createdBy: any, index: number) => (
                        <span key={createdBy._id || index} className="mr-2">
                            {createdBy.username}
                        </span>
                    ))
                ) : rowData.createdBy ? (
                    <span className="mr-2">{(rowData.createdBy as any).username}</span>
                ) : (
                    'N/A'
                )}
            </div>
        );
    };

    const actionBodyTemplate = (rowData: Base.User) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <GenericButton
                    onClick={() => showDetailDialog(rowData)}
                    className="detail-icon"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                    }}
                    aria-label="Details"
                    data-pr-tooltip="Details"
                >
                    <FaEye
                        size={20}
                        style={{
                            color: '#0D6EFD',
                            width: '20px',
                            height: '21px'
                        }}
                    />
                </GenericButton>
                <GenericButton
                    onClick={() => editUser(rowData)}
                    className="edit-icon"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                    }}
                    aria-label="Edit user"
                    data-pr-tooltip="Edit user"
                >
                    <FaPencilAlt
                        size={20}
                        style={{
                            color: '#1e81b0',
                            width: '20px',
                            height: '21px'
                        }}
                    />
                </GenericButton>
                <GenericButton
                    onClick={() => confirmDeleteUser(rowData)}
                    className="delete-icon"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                    }}
                    aria-label="Lock User"
                    data-pr-tooltip="Lock User"
                >
                    <FaUserLock
                        size={20}
                        style={{
                            color: '#21130d',
                            width: '20px',
                            height: '21px'
                        }}
                    />
                </GenericButton>
            </div>
        );
    };

    const formatDate = (value: string) => {
        const date = new Date(value);
        if (!isValid(date)) {
            return 'Invalid date';
        }
        return format(date, 'dd/MM/yyyy HH:mm:ss');
    };

    const moreInfoTemplate = (rowData: any) => (
        <div className="flex justify-content-center">
            <i className="pi pi-eye" style={{ cursor: 'pointer', color: '#0D6EFD' }} onClick={() => showDetailDialog(rowData)} data-pr-tooltip="Details" />
            <Tooltip target=".pi-eye" />
        </div>
    );

    const hideDetailDialog = () => {
        setDetailDialog(false);
        setSelectedUser(null);
    };

    const showDetailDialog = (user: Base.User) => {
        setSelectedUser(user);
        setDetailDialog(true);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePageChange = (event: any) => {
        const currentPage = Math.floor(event.first / event.rows) + 1;
        setPage(currentPage);
        setRows(event.rows);
    };

    return (
        <>
            <div className="layout-main">
                <div className="col-12">
                    <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />
                    <div
                        className="card"
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <FiUsers size={50} />
                            <h1>Quản lý tài khoản</h1>
                        </Box>

                        <Toast ref={toast} />
                        <Toolbar left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                        <DataTable
                            ref={dt}
                            value={filteredUsers || users || []}
                            selection={selectedUsers}
                            onSelectionChange={(e) => setSelectedUsers(e.value as Base.User[])}
                            dataKey="_id"
                            rows={rows}
                            rowsPerPageOptions={[5, 10, 25]}
                            showGridlines
                            globalFilterFields={['detail_user.name', 'username', 'detail_user.user_code']}
                            globalFilter={globalFilter}
                            responsiveLayout="scroll"
                            removableSort
                        >
                            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                            <Column field="detail_user.name" header="Họ tên" filter sortable style={{ minWidth: '12rem' }}></Column>
                            <Column field="detail_user.user_code" header="Mã nhân viên" filter sortable style={{ minWidth: '10rem' }}></Column>
                            <Column field="username" header="Username" filter sortable style={{ minWidth: '10rem' }}></Column>
                            <Column field="roles" header="Vai trò" body={rolesBodyTemplate} sortable style={{ minWidth: '12rem' }}></Column>
                            <Column field="status" header="Trạng thái" body={statusBodyTemplate} sortable style={{ minWidth: '8rem' }}></Column>
                            <Column header="Thao tác" body={actionBodyTemplate} style={{ minWidth: '12rem', maxWidth: '16rem', textAlign: 'center' }}></Column>
                        </DataTable>
                        <Paginator first={(page - 1) * rows} rows={rows} totalRecords={totalRecords} rowsPerPageOptions={[5, 10, 15]} onPageChange={handlePageChange} />
                    </div>

                    {/* User Details Dialog */}
                    <Dialog
                        visible={detailDialog}
                        style={{ width: '500px' }}
                        header="Chi tiết người dùng"
                        modal
                        onHide={hideDetailDialog}
                        footer={
                            <div className="flex justify-content-end">
                                <Button label="Đóng" icon="pi pi-times" outlined onClick={hideDetailDialog} />
                            </div>
                        }
                    >
                        {selectedUser && (
                            <div className="grid">
                                <div className="col-12">
                                    <div className="flex flex-column gap-3">
                                        <div className="flex justify-content-between">
                                            <span className="font-bold">Họ tên:</span>
                                            <span>{selectedUser.detail_user?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="font-bold">Mã nhân viên:</span>
                                            <span>{selectedUser.detail_user?.user_code || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="font-bold">Tên đăng nhập:</span>
                                            <span>{selectedUser.username || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="font-bold">Ngày sinh:</span>
                                            <span>{selectedUser.detail_user?.birth_date ? format(new Date(selectedUser.detail_user.birth_date), 'dd/MM/yyyy') : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="font-bold">Địa chỉ:</span>
                                            <span>{selectedUser.detail_user?.address || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="font-bold">Giới tính:</span>
                                            <span>{selectedUser.detail_user?.gender || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="font-bold">Vai trò:</span>
                                            <span>
                                                {selectedUser.roles && selectedUser.roles.length > 0
                                                    ? selectedUser.roles.map((role: any, index: number) => (
                                                          <span key={index}>
                                                              {role.name}
                                                              {index < selectedUser.roles.length - 1 && ', '}
                                                          </span>
                                                      ))
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="font-bold">Trạng thái:</span>
                                            <Tag
                                                value={selectedUser.status ? 'Active' : 'Deactivate'}
                                                style={{
                                                    borderRadius: '20px',
                                                    padding: '4px 12px',
                                                    backgroundColor: selectedUser.status ? '#0D6EFD' : '#DC3545',
                                                    color: 'white'
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="font-bold">Ngày tạo:</span>
                                            <span>{selectedUser.createdAt ? format(new Date(selectedUser.createdAt), 'dd/MM/yy HH:mm:ss') : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="font-bold">Người tạo:</span>
                                            <span>{selectedUser.createdBy ? (selectedUser.createdBy as any).username : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="font-bold">Ngày cập nhật:</span>
                                            <span>{selectedUser.updatedAt ? format(new Date(selectedUser.updatedAt), 'dd/MM/yy HH:mm:ss') : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="font-bold">Người cập nhật:</span>
                                            <span>{selectedUser.updatedBy ? (selectedUser.updatedBy as any).username : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Dialog>

                    <Dialog visible={deleteUserDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUserDialogFooter} onHide={hideDeleteUserDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {user && (
                                <span>
                                    Bạn có chắc chắn muốn thay đổi trạng thái <strong>{user.username}</strong>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteUsersDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUsersDialogFooter} onHide={hideDeleteUsersDialog}>
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedUsers && <span>Bạn có chắc chắn muốn tiếp tục không?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={userDialog} style={{ width: '450px' }} header={user._id ? 'Sửa tài khoản' : 'Thêm tài khoản'} modal className="p-fluid" footer={userDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="name">Họ tên</label>
                            <InputText id="name" value={user.detail_user?.name || ''} onChange={(e) => onInputChange(e, 'detail_user.name')} className={classNames({ 'p-invalid': submitted && !user.detail_user?.name })} />
                            {submitted && !user.detail_user?.name && <small className="p-error">Họ tên là bắt buộc.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="username">Tên đăng nhập</label>
                            <InputText id="username" value={user.username} onChange={(e) => onInputChange(e, 'username')} className={classNames({ 'p-invalid': submitted && !user.username })} />
                            {submitted && !user.username && <small className="p-error">Tên đăng nhập là bắt buộc.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="password">Mật khẩu</label>
                            <InputText id="password" type="password" value={user.password || ''} onChange={(e) => onInputChange(e, 'password')} className={classNames({ 'p-invalid': submitted && !user.password && !user._id })} />
                            {submitted && !user.password && !user._id && <small className="p-error">Mật khẩu là bắt buộc cho người dùng mới.</small>}
                        </div>

                        <div className="field">
                            <label>Upload ảnh</label>
                            <div className="flex align-items-center border-1 border-round p-3 gap-3 surface-border">
                                <i className="pi pi-download text-primary" style={{ fontSize: '1.5rem' }}></i>
                                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload" />
                                <label htmlFor="file-upload" className="text-primary" style={{ cursor: 'pointer' }}>
                                    Chọn ảnh
                                </label>
                            </div>
                            {preview && (
                                <div className="image-preview">
                                    <img src={preview} alt="Preview" style={{ maxWidth: '100%', marginTop: '10px' }} />
                                </div>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="roles">Vai trò</label>
                            <MultiSelect id="roles" value={user.roles} options={roles} optionLabel="label" onChange={(e) => onMultiSelectChange(e, 'roles')} placeholder="Chọn vai trò" display="chip" />
                        </div>

                        <div className="field">
                            <label htmlFor="user_code">Mã nhân viên</label>
                            <InputText id="user_code" value={user.detail_user?.user_code || ''} onChange={(e) => onInputChange(e, 'detail_user.user_code')} className={classNames({ 'p-invalid': submitted && !user.detail_user?.user_code })} />
                            {submitted && !user.detail_user?.user_code && <small className="p-error">Mã nhân viên là bắt buộc.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="birth_date">Ngày sinh</label>
                            <Calendar
                                showButtonBar
                                showIcon
                                id="birth_date"
                                value={user.detail_user?.birth_date ? new Date(user.detail_user.birth_date) : null}
                                onChange={(e) => {
                                    const customEvent = {
                                        target: {
                                            value: e.value ? e.value.toISOString() : ''
                                        }
                                    } as React.ChangeEvent<HTMLInputElement>;
                                    onInputChange(customEvent, 'detail_user.birth_date');
                                }}
                                dateFormat="dd/mm/yy"
                                placeholder="Chọn ngày sinh"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="gender">Giới tính</label>
                            <div className="grid">
                                <div className="col-12 md:col-4">
                                    <div className="field-radiobutton">
                                        <RadioButton
                                            inputId="Male"
                                            name="gender"
                                            value={1}
                                            checked={user.detail_user.gender === 1}
                                            onChange={(e) => onInputChange({ target: { value: e.value } } as React.ChangeEvent<HTMLInputElement>, 'detail_user.gender')}
                                        />
                                        <label htmlFor="Male">Nam</label>
                                    </div>
                                </div>
                                <div className="col-12 md:col-4">
                                    <div className="field-radiobutton">
                                        <RadioButton
                                            inputId="Female"
                                            name="gender"
                                            value={2}
                                            checked={user.detail_user.gender === 2}
                                            onChange={(e) => onInputChange({ target: { value: e.value } } as React.ChangeEvent<HTMLInputElement>, 'detail_user.gender')}
                                        />
                                        <label htmlFor="Female">Nữ</label>
                                    </div>
                                </div>
                                <div className="col-12 md:col-4">
                                    <div className="field-radiobutton">
                                        <RadioButton
                                            inputId="Other"
                                            name="gender"
                                            value={3}
                                            checked={user.detail_user.gender === 3}
                                            onChange={(e) => onInputChange({ target: { value: e.value } } as React.ChangeEvent<HTMLInputElement>, 'detail_user.gender')}
                                        />
                                        <label htmlFor="other">Khác</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="address">Địa chỉ</label>
                            <InputText id="address" value={user.detail_user.address} onChange={(e) => onInputChange(e, 'detail_user.address')} className={classNames({ 'p-invalid': submitted && !user.detail_user?.address })} />
                            {submitted && !user.detail_user?.address && <small className="p-error">Địa chỉ là bắt buộc.</small>}
                        </div>

                        {/* <div className="field">
                        <div className="flex align-items-center">
                            <Checkbox
                                checked={user.status}
                                onChange={(e) => setUser({ ...user, status: e.checked || false })} />
                            <label htmlFor="status" className="ml-2">Active</label>
                        </div>
                    </div> */}
                    </Dialog>
                </div>
            </div>
            <style jsx global>{`
                .custom-paginator {
                    display: flex;
                    justify-content: flex-end;
                }
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
            `}</style>
        </>
    );
};

export default withPermissions(Crud, [Permissions.LIST_ALL_USERS, Permissions.LIST_ALL_ROLES]);
