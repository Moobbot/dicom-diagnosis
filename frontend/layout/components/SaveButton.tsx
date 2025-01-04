import { Button } from 'primereact/button';
import { Permissions } from '@/enums/permissions.enums';

type Props = {
    permissions: string[];
    label: string;
    onClick: () => void;
};

const SaveButton = ({ permissions, label, onClick }: Props) => {
    return permissions.includes(Permissions.EDIT_PERMISSION) && <Button label={label}  style={{ width: '200px' }} onClick={onClick} />;
};

export default SaveButton;
