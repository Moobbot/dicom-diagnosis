'use client';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import React, { useState } from 'react';

const AccountInfo = () => {
    const breadcrumbHome = { icon: 'pi pi-home', to: '/' };
    const breadcrumbItems = [{ label: 'Thông tin người dùng' }];
    const avatar = localStorage.getItem('avatar');
    const [formData, setFormData] = React.useState({
        fullName: '',
        username: '',
        role: '',
        gender: '',
        dob: '',
        phone: '',
        address: ''
    });
    const genders = ['Nam', 'Nữ', 'Khác'];

    const [genderValue, setGenderValue] = useState(null);
    const handleChange = (e: { target: { name: any; value: any } }) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        console.log('Form Data:', formData);
    };

    return (
        <div className="layout-main">
            <BreadCrumb home={breadcrumbHome} model={breadcrumbItems} />

            <div className="card">
                <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <img
                            src={avatar || ''}
                            alt="Avatar"
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginBottom: '10px'
                            }}
                        />
                        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Hồ Sơ Cá Nhân</h2>
                        <p style={{ margin: 0, color: '#666' }}>Cập nhật thông tin tài khoản của bạn</p>
                    </div>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <span className="p-float-label">
                            <InputText id="fullName" name="fullName" type="text" onChange={handleChange} />
                            <label htmlFor="fullName">Họ tên</label>
                        </span>
                        <span className="p-float-label">
                            <InputText id="username" name="username" type="text" onChange={handleChange} />
                            <label htmlFor="username">Username</label>
                        </span>
                        <InputText name="role" value="Kĩ thuật viên" type="text" onChange={handleChange} readOnly />

                        <Dropdown value={genderValue} onChange={(e) => setGenderValue(e.value)} options={genders} placeholder="Giới tính" />
                        <h6>Thông tin liên hệ</h6>
                        <span className="p-float-label">
                            <InputText id="phone" name="phone" type="text" onChange={handleChange} />
                            <label htmlFor="phone">Số điện thoại</label>
                        </span>
                        <span className="p-float-label">
                            <InputText id="address" name="address" type="text" onChange={handleChange} />
                            <label htmlFor="address">Địa chỉ</label>
                        </span>
                        {/* <input type="text" name="address" placeholder="Địa chỉ" value={formData.address} onChange={handleChange} style={inputStyle} /> */}
                        {/* <button
                type="button"
                onClick={handleSubmit}
                style={{
                    padding: '15px',
                    border: 'none',
                    borderRadius: '30px',
                    backgroundColor: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease-in-out'
                }}
            >
                Cập nhật
            </button> */}
                        <Button label="Cập nhật" onClick={handleSubmit}></Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    width: '100%'
};

export default AccountInfo;
