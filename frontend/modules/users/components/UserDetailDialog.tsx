import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { format } from 'date-fns';
import { Base } from '@/types';
import { Gender } from '@/enums/gender.enum';
interface UserDetailDialogProps {
    visible: boolean;
    onHide: () => void;
    selectedUser: Base.User | null;
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({
    visible,
    onHide,
    selectedUser
}) => {
    return (
        <Dialog
            visible={visible}
            style={{ width: '50vw' }}
            header="Chi tiết người dùng"
            modal
            onHide={onHide}
            footer={
                <div className="flex justify-content-end">
                    <Button label="Đóng" icon="pi pi-times" outlined onClick={onHide} />
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
                                <span>{selectedUser.detail_user?.dob ? format(new Date(selectedUser.detail_user.dob), 'dd/MM/yyyy') : 'N/A'}</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span className="font-bold">Địa chỉ:</span>
                                <span>{selectedUser.detail_user?.address || 'N/A'}</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span className="font-bold">Giới tính:</span>
                                <span>{selectedUser.detail_user?.gender || Gender.OTHER}</span>
                            </div>
                            <div className="flex justify-content-between">
                                <span className="font-bold">Vai trò:</span>
                                <span>
                                    {selectedUser.roles && selectedUser.roles.length > 0
                                        ? selectedUser.roles.map((role: any, index: number) => (
                                            <span key={index}> {role.name} {index < selectedUser.roles.length - 1 && ', '}
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
    );
};

export default UserDetailDialog; 