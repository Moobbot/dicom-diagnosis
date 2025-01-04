import { Permissions } from '@/enums/permissions.enums';
import { Button } from 'primereact/button';

type Props = {
    permissions: string[];
    onClick: () => void;
    label: string;
};

const NewButton = ({ permissions, onClick, label }: Props) => {
    return permissions.includes(Permissions.ADD_PERMISSION) && <Button label={label} icon="pi pi-plus" className="p-button-success mr-2" onClick={onClick} />;
};

export default NewButton;
