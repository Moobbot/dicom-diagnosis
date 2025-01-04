import { Permissions } from '@/enums/permissions.enums';
import { Button } from 'primereact/button';

type Props = {
    permissions: string[];
    onclick: () => void;
};

const EditButton = ({ permissions, onclick }: Props) => {
    permissions.includes(Permissions.EDIT_PERMISSION) && <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={onclick} />;
};

export default EditButton;
