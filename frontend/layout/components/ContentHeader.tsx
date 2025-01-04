import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';

interface Props {
    onFilterChange: (filterValue: string) => void;
    label: string;
}

const ContentHeader: React.FC<Props> = ({ onFilterChange, label }) => {
    const [globalFilter, setGlobalFilter] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setGlobalFilter(value);
        onFilterChange(value);
    };

    return (
        <div className="table-header">
            <h5 className="mx-0 my-1">{label}</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onInput={handleInputChange} placeholder="Search..." />
            </span>
        </div>
    );
};

export default ContentHeader;

// Cách dùng
// import React, { useState } from 'react';
// import TableHeader from './TableHeader';

// const YourComponent: React.FC = () => {
//     const [globalFilter, setGlobalFilter] = useState('');

//     const handleFilterChange = (value: string) => {
//         setGlobalFilter(value);
//     };

//     return (
//         <div>
//             <TableHeader onFilterChange={handleFilterChange} />
//             {/* Các thành phần khác trong component của bạn */}
//         </div>
//     );
// };

// export default YourComponent;
