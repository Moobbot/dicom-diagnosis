import { Button } from 'primereact/button';
import { useUserContext } from '../context/usercontext';

type Props = {
    label?: string; // Nội dung button
    onClick?: () => void; // Hành động khi click
    permissions?: string[]; // Optional - Quyền cần có để hiển thị button
    icon?: string; // Optional - Icon hiển thị kèm
    className?: string; // Optional - Lớp CSS tùy chỉnh
    disabled?: boolean; // Optional - Trạng thái vô hiệu hóa
    rounded?: boolean; // Optional - Có bo tròn button hay không
    outlined?: boolean; // Optional - Có chỉ viền hay không
    text?: boolean; // Optional - Chỉ hiển thị text, không nền hoặc viền
    style?: React.CSSProperties; // Optional - CSS tùy chỉnh
    type?: 'button' | 'submit' | 'reset'; // Loại button
    severity?: 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help' | undefined;// Severity type
    children?: React.ReactNode; // Nội dung bên trong button
};

const GenericButton = ({
    label,
    onClick,
    permissions = [],
    icon,
    className = '',
    disabled = false,
    rounded = false,
    outlined = false,
    text = false,
    style,
    type = 'button', // Mặc định là button
    severity,
    children, 
}: Props) => {
    const { user } = useUserContext();

    // Kiểm tra quyền
    const hasPermission =
        !permissions.length || (user && (user.grantAll || permissions.every((permission) => user.permissions.includes(permission))));

    if (!hasPermission) {
        return null;
    }

    // Xây dựng lớp CSS động
    const buttonClassName = [
        className,
        style,
        rounded ? 'p-button-rounded' : '',
        outlined ? 'p-button-outlined' : '',
        text ? 'p-button-text' : '',
    ]
        .filter(Boolean) // Loại bỏ các giá trị rỗng
        .join(' ');

    return (
        <Button
            label={label}
            icon={icon}
            className={buttonClassName}
            onClick={onClick}
            disabled={disabled}
            style={style} // Áp dụng CSS tùy chỉnh
            type={type} // Loại button
            severity={severity}
        >
            {children} 
        </Button>
    );
};

export default GenericButton;