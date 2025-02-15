import { Permissions } from '@/enums/permissions.enums';
import { Button } from 'primereact/button';
import { useUserContext } from '../context/usercontext';

type Props = {
    permissions: string[];
    onClick: () => void;
    label: string;
};

const NewButton = ({ permissions, onClick, label }: Props) => {
    const { user } = useUserContext();
    const hasPermission = user && (user.grantAll || permissions.every((permission) => user.permissions.includes(permission)));

    return hasPermission && <Button label={label} icon="pi pi-plus" className="p-button-success mr-2" onClick={onClick} />;
};

export default NewButton;
