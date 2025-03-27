import React, { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { Base } from '@/types';
import GenericButton from '@/layout/components/GenericButton';
import { Gender } from '@/enums/gender.enum';

interface UserDialogProps {
    visible: boolean;
    onHide: () => void;
    user: Base.User;
    isEditing: boolean;
    submitted: boolean;
    roles: { label: string; value: Base.Role }[];
    preview: string | null;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void;
    onMultiSelectChange: (e: { value: Base.Role[] }, name: string) => void;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
}

const UserDialog: React.FC<UserDialogProps> = ({
    visible,
    onHide,
    user,
    isEditing,
    submitted,
    roles,
    preview,
    onInputChange,
    onMultiSelectChange,
    onFileChange,
    onSave
}) => {
    return (
        <Dialog visible={visible} style={{ width: '60vw' }} header={isEditing ? 'Sửa tài khoản' : 'Thêm tài khoản'} modal className="p-fluid" footer={
            <React.Fragment>
                <GenericButton label="Hủy" icon="pi pi-times" className="p-button" onClick={onHide} severity="danger"/>
                <GenericButton label="Lưu" icon="pi pi-check" className="p-button" onClick={onSave} severity="success"/>
            </React.Fragment>
        } onHide={onHide}>
            <div className="grid">
                <div className="col-6">
                    <div className="field w-full">
                        <label htmlFor="username" className="font-bold">
                            Tên đăng nhập <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="username"
                            value={user.username}
                            onChange={(e) => onInputChange(e, 'username')}
                            required
                            className={classNames({ 'p-invalid': submitted && !user.username })}
                            disabled={isEditing}
                            placeholder="Nhập tên đăng nhập"
                        />
                        {submitted && !user.username && <small className="p-error">Tên đăng nhập là bắt buộc.</small>}
                    </div>
                </div>
                <div className="col-6">
                    <div className="field w-full">
                        <label htmlFor="password" className="font-bold">
                            Mật khẩu {!isEditing && <span className="text-red-500">*</span>}
                        </label>
                        <InputText
                            id="password"
                            type="password"
                            value={user.password || ''}
                            onChange={(e) => onInputChange(e, 'password')}
                            required={!isEditing}
                            className={classNames({ 'p-invalid': (submitted && !isEditing && !user.password) || (user.password && user.password.length < 6) })}
                            placeholder={isEditing ? "Nhập để thay đổi mật khẩu" : "Nhập mật khẩu"}
                        />
                        {submitted && !isEditing && !user.password && <small className="p-error">Mật khẩu là bắt buộc.</small>}
                        {submitted && user.password && user.password.length < 6 && <small className="p-error">Mật khẩu phải có ít nhất 6 ký tự.</small>}
                    </div>
                </div>
                <div className="col-6">
                    <div className="field w-full">
                        <label htmlFor="detail_user.name" className="font-bold">
                            Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="detail_user.name"
                            value={user.detail_user?.name || ''}
                            onChange={(e) => onInputChange(e, 'detail_user.name')}
                            required
                            className={classNames({ 'p-invalid': submitted && !user.detail_user?.name })}
                            placeholder="Nhập họ và tên"
                        />
                        {submitted && !user.detail_user?.name && <small className="p-error">Họ và tên là bắt buộc.</small>}
                    </div>
                </div>
                <div className="col-6">
                    <div className="field w-full">
                        <label htmlFor="detail_user.user_code" className="font-bold">
                            Mã nhân viên <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="detail_user.user_code"
                            value={user.detail_user?.user_code || ''}
                            onChange={(e) => onInputChange(e, 'detail_user.user_code')}
                            required
                            className={classNames({ 'p-invalid': submitted && !user.detail_user?.user_code })}
                            placeholder="Nhập mã nhân viên"
                        />
                        {submitted && !user.detail_user?.user_code && <small className="p-error">Mã nhân viên là bắt buộc.</small>}
                    </div>
                </div>
                <div className="col-6">
                    <div className="field w-full">
                        <label htmlFor="roles" className="font-bold">
                            Vai trò <span className="text-red-500">*</span>
                        </label>
                        <MultiSelect
                            id="roles"
                            value={user.roles}
                            options={roles}
                            onChange={(e) => onMultiSelectChange(e, 'roles')}
                            optionLabel="label"
                            placeholder="Chọn vai trò"
                            className={classNames({ 'p-invalid': submitted && (!user.roles || user.roles.length === 0) })}
                            display="chip"
                        />
                        {submitted && (!user.roles || user.roles.length === 0) && <small className="p-error">Vai trò là bắt buộc.</small>}
                    </div>
                </div>
                {!isEditing && (
                    <>
                        <div className="col-6">
                            <div className="field w-full">
                                <label htmlFor="detail_user.dob" className="font-bold">Ngày sinh <span className="text-red-500">*</span></label>
                                <Calendar
                                    id="detail_user.dob"
                                    value={user.detail_user?.dob ? new Date(user.detail_user.dob) : null}
                                    onChange={(e) => {
                                        const date = e.value as Date;
                                        if (date) {
                                            const formattedDate = date.toISOString().split('T')[0];
                                            onInputChange({ target: { value: formattedDate } } as any, 'detail_user.dob');
                                        } else {
                                            onInputChange({ target: { value: '' } } as any, 'detail_user.dob');
                                        }
                                    }}
                                    dateFormat="dd/mm/yy"
                                    placeholder="Chọn ngày sinh"
                                    showIcon
                                />
                                {submitted && !user.detail_user?.dob && <small className="p-error">Ngày sinh là bắt buộc.</small>}
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="field w-full">
                                <label htmlFor="detail_user.gender" className="font-bold">
                                    Giới tính <span className="text-red-500">*</span>
                                </label>
                                <Dropdown
                                    id="detail_user.gender"
                                    value={user.detail_user.gender}
                                    options={[
                                        { label: 'Nam', value: Gender.MALE },
                                        { label: 'Nữ', value: Gender.FEMALE },
                                        { label: 'Khác', value: Gender.OTHER }
                                    ]}
                                    onChange={(e: { value: number }) => onInputChange({ target: { value: e.value } } as any, 'detail_user.gender')}
                                    placeholder="Chọn giới tính"
                                    className={classNames({ 'p-invalid': submitted && user.detail_user.gender === undefined })}
                                />
                                {submitted && user.detail_user.gender === undefined && <small className="p-error">Giới tính là bắt buộc.</small>}
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field w-full">
                                <label htmlFor="detail_user.address" className="font-bold"> Địa chỉ </label>
                                <InputText
                                    id="detail_user.address"
                                    value={user.detail_user.address || ''}
                                    onChange={(e) => onInputChange(e, 'detail_user.address')}
                                    placeholder="Nhập địa chỉ"
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <label htmlFor="upload-image" className='block mb-2'>Ảnh đại diện</label>
                            <div className="flex align-items-center border-1 border-round p-2 gap-3 surface-border">
                                <i className="pi pi-download text-primary"></i>
                                <input type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} id="file-upload" />
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
                    </>
                )}
            </div>
        </Dialog>
    );
};

export default UserDialog; 