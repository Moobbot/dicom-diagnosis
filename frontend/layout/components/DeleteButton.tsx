import { Permissions } from '@/enums/permissions.enums';
import { Button } from 'primereact/button';

type Props = {
    permissions: string[];
    onclick: () => void;
    selected: any[];
    label: string;
};

const DeleteButton = ({ permissions, onclick, selected, label }: Props) => {
    return permissions.includes(Permissions.DELETE_PERMISSION) && <Button label={label} icon="pi pi-trash" className="p-button-danger" onClick={onclick} disabled={!selected || !selected.length} />;
};

export default DeleteButton;
