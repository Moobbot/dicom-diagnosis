import GenericButton from './GenericButton';

const NewButton = ({ label, onClick, permissions }: { label: string; onClick: () => void; permissions: string[] }) => {
    return <GenericButton
        label={label}
        icon="pi pi-plus" onClick={onClick}
        permissions={permissions}
        style={{ width: '100px', height: '40px' }}
        className="p-button-success" />;
};

export default NewButton;