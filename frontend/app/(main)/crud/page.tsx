'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import UserService from '../../../modules/admin/service/UserService';
import { Base } from '@/types';
import RoleService from '../../../modules/admin/service/RoleService';
import { MultiSelect } from 'primereact/multiselect';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Badge } from 'primereact/badge';
import { classNames } from 'primereact/utils';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import ExportButton from '@/layout/components/ExportButton';
import CancelButton from '@/layout/components/CancelButton';
import DeleteButton from '@/layout/components/DeleteButton';
import NewButton from '@/layout/components/NewButton';
import SaveButton from '@/layout/components/SaveButton';
import { Permissions } from '@/enums/permissions.enums';
import RBAC from '@/app/api/RBAC';
import { format, isValid } from 'date-fns';
import Box from '@mui/material/Box';
import { FiGrid, FiUser, FiUserPlus, FiUsers } from 'react-icons/fi';

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
            birth_date: '',
            address: '',
            gender: ''
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
    const breadcrumbItems = [{ label: 'Quản lý người dùng'}];

    let permissions = RBAC();
    useEffect(() => {
        const fetchUsers = async (page: number, rows: number) => {
            try {
                const response = await userService.getUsers(1, 40); // sẽ thêm page,limit row per page sau
                setUsers(response.data);
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch users' });
            }
        };

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

        fetchUsers(page, rows);
        fetchRoles();
    }, [page, rows]);

    const openNew = () => {
        setUser(emptyUser);
        setSubmitted(false);
        setUserDialog(true);
    };

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
                const updatedUsers = users?.map(u => (u._id === updatedUser._id ? updatedUser : u));
                setUsers(updatedUsers || null);
                setUserDialog(false);
                setUser(emptyUser);
                toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 });
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

            if (_user.detail_user && _user.detail_user.birth_date) {
                _user.detail_user.birth_date = format(new Date(_user.detail_user.birth_date), 'yyyy-MM-dd');
            }

            if (user._id) {
                try {
                    const updatedUser = await userService.updateUser(_user._id.toString(), {
                        password: _user.password,
                        roles: _user.roles.map((role: Base.Role) => role._id)
                    });
                    const index = findIndexById(user._id);
                    _users[index] = updatedUser;
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 });
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update user' });
                }
            } else {
                try {
                    const createdUser = await userService.createUser(_user);
                    _users.push(createdUser);
                    toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'User Created', life: 3000 });
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to create user' });
                }
            }

            setUsers(_users);
            setUserDialog(false);
            setUser(emptyUser);
        }
    };

    {/* const onPage = (event) => {
        setPage(event.page + 1); // Cập nhật state page khi người dùng thay đổi trang
        setRows(event.rows); // Cập nhật state rows khi người dùng thay đổi số lượng hàng mỗi trang
    }; */}

    const editUser = (user: Base.User) => {
        const activeRoles = user.roles.filter((role: any) => role.status === true);
        setUser({ ...user, roles: activeRoles });
        setUserDialog(true);
    };

    const confirmDeleteUser = (user: Base.User) => {
        setUser(user);
        setDeleteUserDialog(true);
    };

    const changeUserStatus = async () => {
        try {
            await userService.changeUserStatus(user._id.toString(), false);
            let _users = users?.map(val => val._id === user._id ? { ...val, status: false } : val);
            setUsers(_users || null);
            setDeleteUserDialog(false);
            setUser(emptyUser);
            toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete user' });
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
                setUsers((prevUsers) =>
                    prevUsers?.map((user) =>
                        updatedUsers.find((updatedUser) => updatedUser._id === user._id) || user
                    ) || null
                );
                toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Users Status Changed', life: 3000 });
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to change user status' });
            }
        }
    };

    const deleteSelectedUsers = async () => {
        let _users = users?.filter(val => !selectedUsers?.includes(val));
        setUsers(_users || null);
        setDeleteUsersDialog(false);
        setSelectedUsers(null);
        toast.current?.show({ severity: 'success', summary: 'Successful', detail: 'Users Deleted', life: 3000 });
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _user = { ...user };
        (_user as any)[name] = val;

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
            activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
        });
        setGlobalFilter('');
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <NewButton permissions={permissions} onClick={openNew} label="New" />
                <DeleteButton permissions={permissions} onclick={confirmDeleteSelected} selected={selectedUsers || []} label="Delete" />
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const userDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button-text" onClick={saveUser} />
        </React.Fragment>
    );

    const deleteUserDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteUserDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={changeUserStatus} />
        </React.Fragment>
    );

    const deleteUsersDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteUsersDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedUsers} />
        </React.Fragment>
    );

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalFilter(e.target.value);
    };

    const header = (
        <div className="table-header">
            <h5 className="mx-0 my-1">Manage Users</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    value={globalFilter || ''}
                    onChange={onGlobalFilterChange}
                    placeholder="Search..."
                />
            </span>
        </div>
    );

    /*    const statusBodyTemplate = (rowData: Base.User) => {
            return (
                <span className={`product-badge status-${rowData.status === true ? 'instock' : 'outofstock'}`}>
                    {rowData.status === true ? 'Active' : 'Deactivated'}
                </span>
            );
        }; */

    const statusBodyTemplate = (rowData: Base.User) => {
        return <span className={`product-badge status-${rowData.status === true ? 'instock' : 'outofstock'}`}>{rowData.status === true ? 'Active' : 'Deactivated'}</span>;
    };

    const rolesBodyTemplate = (rowData: Base.User) => {
        return (
            <div>
                {Array.isArray(rowData.roles) ? (
                    rowData.roles.map((role: Base.Role) => (
                        <Badge key={role._id} value={role.name} severity="info" className="mr-2" />
                    ))
                ) : (
                    <span>No roles assigned</span>
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
                return (
                    <span className="mr-2">
                        {(rowData.updatedBy as Base.User).username ?? 'Unknown'}
                    </span>
                );
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
                        <span key={createdBy._id || index} className="mr-2">{createdBy.username}</span>
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
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded severity="success" onClick={() => editUser(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteUser(rowData)} />
            </React.Fragment>
        );
    };

    const formatDate = (value: string) => {
        const date = new Date(value);
        if (!isValid(date)) {
            return 'Invalid date';
        }
        return format(date, 'dd/MM/yyyy HH:mm:ss');
    };

    return (
        <div className="layout-main">
            <div className="col-12">
                <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />
                <div className="card"
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                    }}
                    >
                    {/* Phần chứa tiêu đề */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center", // Căn giữa theo trục dọc
                        gap: "10px",
                    }}
                >
                    <FiUsers size={50} />
                    <h2>Quản lý người dùng</h2>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center", // Căn giữa theo trục dọc
                        gap: "10px",
                    }}
                >
                </Box>
                        
                    <Toast ref={toast} />
                    <Toolbar className="" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={users || []}
                        selection={selectedUsers}
                        onSelectionChange={(e) => setSelectedUsers(e.value as Base.User[])}
                        dataKey="_id"
                        paginator
                        showGridlines
                        rows={rows}
                        rowsPerPageOptions={[5, 10, 25]}
                        globalFilterFields={['username', 'name', 'roles.name']}
                        globalFilter={globalFilter}
                        header={header}
                        responsiveLayout="scroll"
                        removableSort
                    // onPage={onPage} 
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="_id" header="ID" filter sortable style={{ minWidth: '12rem' }}></Column>
                        <Column field="username" header="Username" filter sortable style={{ minWidth: '12rem' }}></Column>
                        <Column field="createdBy" header="Created By" sortable body={CreateByBodyTemplate} style={{ minWidth: '12rem' }}></Column>
                        <Column field="createdAt" header="Created At" sortable body={(rowData) => formatDate(rowData.createdAt)} />
                        <Column field="updatedBy" header="Updated By" sortable body={UpdateByBodyTemplate} style={{ minWidth: '12rem' }}></Column>
                        <Column field="updatedAt" header="Updated At" sortable body={(rowData) => formatDate(rowData.updatedAt)} />
                        <Column field="roles" header="Roles" filter body={rolesBodyTemplate} sortable style={{ minWidth: '12rem' }}></Column>
                        <Column field="status" header="Status" filter body={statusBodyTemplate} sortable style={{ minWidth: '12rem' }}></Column>
                        <Column header="Thao tác" body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                </div>

                <Dialog visible={userDialog} style={{ width: '450px' }} header="User Details" modal className="p-fluid" footer={userDialogFooter} onHide={hideDialog}>
                    <div className="field">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <InputText id="username" value={user.username} onChange={(e) => onInputChange(e, 'username')} required className={classNames({ 'p-invalid': submitted && !user.username })} />
                        {submitted && !user.username && <small className="p-error">Tên đăng nhập là bắt buộc.</small>}
                    </div>

                    <div className="field">
                        <label htmlFor="password">Mật khẩu</label>
                        <InputText id="password" value={user.password} onChange={(e) => onInputChange(e, 'password')} required className={classNames({ 'p-invalid': submitted && !user.password })} />
                        {submitted && !user.password && <small className="p-error">Mật khẩu là bắt buộc</small>}
                    </div>

                    <div className="field">
                        <label htmlFor="role">Role</label>
                        <MultiSelect
                            id="roles"
                            value={user.roles}
                            options={roles}
                            onChange={(e) => setUser({ ...user, roles: e.value })}
                            optionLabel="label"
                            placeholder="Select Roles"
                            display="chip" />
                    </div>
                </Dialog>

                <Dialog visible={deleteUserDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUserDialogFooter} onHide={hideDeleteUserDialog}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {user && <span>Are you sure you want to change <b>{user.username}</b>'s status?</span>}
                    </div>
                </Dialog>

                <Dialog visible={deleteUsersDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUsersDialogFooter} onHide={hideDeleteUsersDialog}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {selectedUsers && <span>Are you sure you want to delete the selected users?</span>}
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default Crud;