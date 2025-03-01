import GenericButton from './GenericButton';

const DeleteButton = ({ label, onClick, permissions, selected }: { label: string; onClick: () => void; permissions: string[]; selected: any[] }) => {
    return (
        <GenericButton
            label={label}
            icon="pi pi-lock"
            className="p-button-danger"
            onClick={onClick}
            permissions={permissions}
            disabled={!selected || !selected.length}
            style={{ width: '100px', height: '40px' }} 
        />
    );
};

export default DeleteButton;