import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Base } from '@/types';
import GenericButton from '@/layout/components/GenericButton';

interface DeleteDialogProps {
    visible: boolean;
    onHide: () => void;
    user: Base.User | null;
    onConfirm: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
    visible,
    onHide,
    user,
    onConfirm
}) => {
    return (
        <Dialog 
            visible={visible} 
            style={{ width: '450px' }} 
            header="Confirm" 
            modal 
            footer={
                <React.Fragment>
                    <GenericButton label="No" icon="pi pi-times" className="p-button-text" onClick={onHide} />
                    <GenericButton label="Yes" icon="pi pi-check" severity="danger" className="p-button-text" onClick={onConfirm} />
                </React.Fragment>
            } 
            onHide={onHide}
        >
            <div className="confirmation-content">
                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                {user && (
                    <span>
                        Bạn có chắc chắn muốn {user.status ? 'khóa' : 'mở khóa'} tài khoản <strong>{user.username}</strong>?
                    </span>
                )}
            </div>
        </Dialog>
    );
};

export default DeleteDialog; 