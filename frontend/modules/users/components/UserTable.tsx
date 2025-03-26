import React, { forwardRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { FaPencilAlt, FaUserLock } from 'react-icons/fa';
import GenericButton from '@/layout/components/GenericButton';
import { Base } from '@/types';

interface UserTableProps {
    users: Base.User[] | null;
    selectedUsers: Base.User[] | null;
    onSelectionChange: (e: { value: Base.User[] }) => void;
    onEdit: (user: Base.User) => void;
    onDelete: (user: Base.User) => void;
    loading?: boolean;
    filters?: any;
    globalFilter?: string | null;
    dataKey: string;
    rows: number;
    rowsPerPageOptions: number[];
    showGridlines?: boolean;
    scrollable?: boolean;
    removableSort?: boolean;
}

const UserTable = forwardRef<DataTable<any>, UserTableProps>((props, ref) => {
    const {
        users,
        selectedUsers,
        onSelectionChange,
        onEdit,
        onDelete,
        loading,
        filters,
        globalFilter,
        dataKey,
        rows,
        rowsPerPageOptions,
        showGridlines,
        scrollable,
        removableSort
    } = props;

    // Xử lý dữ liệu trước khi render
    const processedUsers = users?.map(user => ({
        ...user,
        rolesText: Array.isArray(user.roles) ? user.roles.map(role => role.name).join(', ') : 'N/A'
    }));

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
        if (!Array.isArray(rowData.roles)) {
            return <span>N/A</span>;
        }

        const roleNames = rowData.roles.map(role => role.name).join(', ');
        
        return (
            <div className="flex align-items-center justify-content-center flex-wrap gap-2">
                {rowData.roles.map((role: Base.Role, index: number) => (
                    <Tag
                        key={`${rowData._id}-${role._id || index}`}
                        className="mr-2"
                        severity="info"
                        value={role.name}
                    />
                ))}
                <span style={{ display: 'none' }}>{roleNames}</span>
            </div>
        );
    };

    const actionBodyTemplate = (rowData: Base.User) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <GenericButton
                    onClick={() => onEdit(rowData)}
                    className="edit-icon"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                    }}
                    aria-label="Chỉnh sửa người dùng"
                    data-pr-tooltip="Chỉnh sửa"
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
                    onClick={() => onDelete(rowData)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                    }}
                    aria-label={rowData.status ? 'Khóa người dùng' : 'Mở khóa người dùng'}
                    data-pr-tooltip={rowData.status ? 'Khóa' : 'Mở khóa'}
                >
                    <FaUserLock
                        size={20}
                        style={{
                            color: 'red',
                            width: '20px',
                            height: '21px'
                        }}
                    />
                </GenericButton>
            </div>
        );
    };

    return (
        <DataTable
            ref={ref}
            value={processedUsers || []}
            selection={selectedUsers}
            onSelectionChange={onSelectionChange}
            dataKey={dataKey}
            rows={rows}
            rowsPerPageOptions={rowsPerPageOptions}
            showGridlines={showGridlines}
            loading={loading}
            globalFilterFields={['detail_user.name', 'username', 'detail_user.user_code']}
            filters={filters}
            globalFilter={globalFilter}
            emptyMessage="No users found."
            scrollable={scrollable}
            removableSort={removableSort}
        >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="detail_user.user_code" header="Mã nhân viên" filter sortable style={{ minWidth: '10rem' }} ></Column>
            <Column field="detail_user.name" header="Họ tên" filter sortable style={{ minWidth: '12rem' }} ></Column>
            <Column field="username" header="Tài khoản" filter sortable style={{ minWidth: '10rem' }} ></Column>
            <Column field="roles" header="Vai trò" body={rolesBodyTemplate} sortable style={{ minWidth: '12rem' }} exportable={false}></Column>
            <Column field="rolesText" header="Vai trò" exportable style={{ display: 'none' }}></Column>
            <Column field="status" header="Trạng thái" body={statusBodyTemplate} sortable style={{ minWidth: '8rem' }} ></Column>
            <Column header="Thao tác" body={actionBodyTemplate} style={{ minWidth: '10rem', maxWidth: '14rem' }} exportable={false}></Column>
        </DataTable>
    );
});

UserTable.displayName = 'UserTable';

export default UserTable; 