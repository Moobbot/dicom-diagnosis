import { Permissions } from '@/enums/permissions.enums';
import { Button } from 'primereact/button';
import { useUserContext } from '../context/usercontext';

type Props = {
    permissions: string[];
    onclick: () => void;
    selected: any[];
    label: string;
};

const DeleteButton = ({ permissions, onclick, selected, label }: Props) => {
    const { user } = useUserContext();
    const hasPermission = user && (user.grantAll || permissions.every((permission) => user.permissions.includes(permission)));

    return hasPermission && <Button label={label} icon="pi pi-trash" className="p-button-danger" onClick={onclick} disabled={!selected || !selected.length} />;
};

export default DeleteButton;
