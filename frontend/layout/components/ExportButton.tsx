import { Permissions } from '@/enums/permissions.enums';
import { Button } from 'primereact/button';

type Props = {
    onClick: () => void;
    label: string;
};

const ExportButton = ({ onClick, label }: Props) => {
    return <Button label={label} icon="pi pi-upload" className="p-button-help" onClick={onClick} />;
};

export default ExportButton;
