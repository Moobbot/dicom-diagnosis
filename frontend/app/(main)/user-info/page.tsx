'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { BreadCrumb } from 'primereact/breadcrumb';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

import GenericButton from '@/layout/components/GenericButton';
import { Base } from '@/types/base';
import { Gender } from '@/enums/gender.enum';
import AuthService from '@/modules/admin/service/AuthService';

interface UserData {
    userId: string;
    username: string;
    permissions: string[];
    roles: string[];
    detail_user: Base.DetailUser;
}

interface FormData {
    fullName: string;
    username: string;
    roles: string;
    roleIds: string[];
    gender: number;
    dob: string;
    address: string;
    user_code: string;
}

interface GenderOption {
    label: string;
    value: number;
}

// Sử dụng định nghĩa UpdateUserData từ API
interface UpdateUserData {
    password?: string;
    roles?: string[];
    detail_user?: Base.DetailUser;
}

const AccountInfo: React.FC = () => {
    const toast = useRef<Toast>(null);
    const breadcrumbHome = { icon: 'pi pi-home', to: '/' };
    const breadcrumbItems = [{ label: 'User information' }];
    const genders: GenderOption[] = [
        { label: 'Male', value: Gender.MALE },
        { label: 'Female', value: Gender.FEMALE },
        { label: 'Other', value: Gender.OTHER }
    ];

    const [userId, setUserId] = useState<string>('');
    const [showUpdateDialog, setShowUpdateDialog] = useState<boolean>(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        username: '',
        roles: '',
        roleIds: [],
        gender: Gender.OTHER,
        dob: '',
        address: '',
        user_code: ''
    });
    const [editFormData, setEditFormData] = useState<FormData>({
        fullName: '',
        username: '',
        roles: '',
        roleIds: [],
        gender: Gender.OTHER,
        dob: '',
        address: '',
        user_code: ''
    });
    const [avatar, setAvatar] = useState<string>('layout/images/default-avatar.png');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            fetchUserData(storedUserId);
        }
    }, []);

    const showToast = useCallback((severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail });
        }
    }, []);

    const fetchUserData = async (id: string): Promise<void> => {
        try {
            const response = await AuthService.getMe();
            if (response) {
                setUserData(response.data);

                const newFormData = {
                    fullName: response.data.detail_user?.name || '',
                    username: response.data.username || '',
                    roles: response.data.roles?.join(', ') || '',
                    roleIds: response.data.permissions || [],
                    gender: response.data.detail_user?.gender || Gender.OTHER,
                    dob: response.data.detail_user?.dob ? new Date(response.data.detail_user.dob).toISOString().split('T')[0] : '',
                    address: response.data.detail_user?.address || '',
                    user_code: response.data.detail_user?.user_code || ''
                };

                setFormData(newFormData);
                setEditFormData(newFormData);

                // Set avatar or use default
                setAvatar(response.data.detail_user?.avatar || 'layout/images/default-avatar.png');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (toast.current) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể tải thông tin người dùng',
                    life: 3000
                });
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
    };

    const handleGenderChange = (e: { value: number }): void => {
        setEditFormData({ ...editFormData, gender: e.value });
    };

    const handleDateChange = (e: any): void => {
        if (e.value) {
            const formattedDate = e.value instanceof Date ? e.value.toISOString().split('T')[0] : new Date(e.value).toISOString().split('T')[0];
            setEditFormData({ ...editFormData, dob: formattedDate });
        }
    };

    const openUpdateDialog = (): void => {
        setEditFormData({ ...formData });
        setShowUpdateDialog(true);
    };

    const closeUpdateDialog = (): void => {
        setShowUpdateDialog(false);
    };

    const handleSubmit = async (): Promise<void> => {
        try {
            const updateData: UpdateUserData = {
                detail_user: {
                    name: editFormData.fullName,
                    gender: editFormData.gender || Gender.OTHER,
                    dob: editFormData.dob,
                    address: editFormData.address,
                    user_code: editFormData.user_code
                }
            };
            const response = await AuthService.updateProfile(updateData);

            showToast('success', 'Success', response.message || 'Update profile successfully');
            fetchUserData(userId);
            closeUpdateDialog();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            showToast('error', 'Error', `Cannot update profile: ${error.message}`);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        console.log('file', file);

        if (!file) return;

        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_FILE_SIZE) {
            showToast('error', 'Error', 'File size must not exceed 2MB');
            return;
        }

        // Kiểm tra file extension thay vì chỉ dựa vào MIME type
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png'];
        const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

        if (!hasValidExtension) {
            showToast('error', 'Error', 'Only PNG, JPG or JPEG files are allowed');
            return;
        }

        try {
            await AuthService.changeAvatar(file);

            // Refresh user data để lấy avatar mới từ server
            await fetchUserData(userId);

            showToast('success', 'Success', 'Update avatar successfully');
        } catch (error: any) {
            console.error('Error updating avatar:', error);
            // Xử lý lỗi từ response của server
            const errorMessage = error.response?.data?.message || error.message || 'Cannot update avatar';
            showToast('error', 'Error', errorMessage);
        }
    };

    // Format display date
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Render update dialog content
    const renderUpdateDialog = () => {
        return (
            <Dialog
                header="Update personal information"
                visible={showUpdateDialog}
                style={{ width: '50vw' }}
                onHide={closeUpdateDialog}
                footer={
                    <div>
                        <GenericButton label="Cancel" onClick={closeUpdateDialog} severity="secondary" style={{ marginRight: '10px' }} />
                        <GenericButton label="Save information" onClick={handleSubmit} />
                    </div>
                }
            >
                <div className="grid formgrid p-fluid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="edit-fullName">Full name</label>
                        <InputText id="edit-fullName" name="fullName" value={editFormData.fullName} onChange={handleChange} />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="edit-username">Username</label>
                        <InputText id="edit-username" name="username" value={editFormData.username} disabled />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="edit-roles">Role</label>
                        <InputText id="edit-roles" name="roles" value={editFormData.roles} disabled />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="edit-gender">Gender</label>
                        <Dropdown id="edit-gender" placeholder="Select gender" value={editFormData.gender} onChange={handleGenderChange} options={genders} optionLabel="label" />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="edit-dob">Date of birth</label>
                        <Calendar id="edit-dob" value={editFormData.dob ? new Date(editFormData.dob) : null} onChange={handleDateChange} dateFormat="dd/mm/yy" showIcon />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="edit-address">Address</label>
                        <InputText id="edit-address" name="address" value={editFormData.address} onChange={handleChange} />
                    </div>
                </div>
            </Dialog>
        );
    };

    // Render information field
    const renderInfoField = (label: string, value: string | number) => {
        let displayValue = value;
        if (label === 'Giới tính') {
            displayValue = value === 1 ? 'Nam' : value === 2 ? 'Nữ' : '—';
        }
        return (
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>{label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{displayValue || '—'}</div>
            </div>
        );
    };

    return (
        <div className="layout-main">
            <Toast ref={toast} />
            <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} style={{ marginBottom: '8px' }} />

            <div className="card">
                <div style={{ maxWidth: '62.5rem', margin: 'auto', padding: '1.25rem' }}>
                    <h2 style={{ marginBottom: '1.25rem' }}>Personal information</h2>

                    <Card>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
                            {/* Left column - Avatar and basic info */}
                            <div style={{ flex: '1', maxWidth: '15.625rem', textAlign: 'center' }}>
                                <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }} onClick={handleAvatarClick}>
                                    <img
                                        src={avatar}
                                        alt="Avatar"
                                        style={{
                                            width: '9.375rem',
                                            height: '9.375rem',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '3px solid #f0f0f0',
                                            marginBottom: '1rem'
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: '1rem',
                                            right: '0',
                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            padding: '5px',
                                            borderRadius: '50%',
                                            width: '30px',
                                            height: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <i className="pi pi-camera" />
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
                                <h3 style={{ margin: '5px 0' }}>{formData.fullName}</h3>
                                <p style={{ margin: '0', color: '#666' }}>{formData.roles}</p>

                                <div style={{ marginTop: '1.25rem' }}>
                                    <GenericButton label="Update information" onClick={openUpdateDialog} style={{ width: '100%' }} icon="pi pi-user-edit" />
                                </div>
                            </div>

                            {/* Right column - User information */}
                            <div style={{ flex: '3', maxWidth: '46.875rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    {renderInfoField('Full name', formData.fullName)}
                                    {renderInfoField('Username', formData.username)}
                                    {renderInfoField('Role', formData.roles)}
                                    {renderInfoField('Gender', formData.gender)}
                                    {renderInfoField('Date of birth', formatDate(formData.dob))}
                                    {/* {renderInfoField('Số điện thoại', formData.phone)} */}
                                    {renderInfoField('Address', formData.address)}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Update Dialog */}
            {renderUpdateDialog()}
        </div>
    );
};

export default AccountInfo;
