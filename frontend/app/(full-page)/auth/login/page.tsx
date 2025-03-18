'use client';

// React and Next.js imports
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Form management
import { Form, Field } from 'react-final-form';

// PrimeReact components
import { classNames } from 'primereact/utils';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';

// Context
import { useUserContext } from '@/layout/context/usercontext';

// Custom components and API
import GenericButton from '@/layout/components/GenericButton';
import { login } from '@/app/api/authApi';

const LoginPage = () => {
    const [formData, setFormData] = useState({});
    const { user, setUser } = useUserContext();
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden');

    const validate = (data: any) => {
        let errors: any = {};

        if (!data.username) {
            errors.username = 'Name is required.';
        }

        if (!data.password) {
            errors.password = 'Password is required.';
        }

        return errors;
    };

    const onSubmit = async (data: any, form: any) => {
        setFormData(data);
        try {
            const response = await login(data.username, data.password);
            if (response && response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('userId', response.data._id);
                
                try {
                    await fetch('/api/auth', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(response)
                    });
                    setUser(response.data);
                    router.push('/');
                } catch (fetchError) {
                    console.error('Error saving auth token:', fetchError);
                    toast.current?.show({ 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: 'Failed to save authentication. Please try again.' 
                    });
                }
            } else {
                toast.current?.show({ 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: 'Invalid response from server. Please try again.' 
                });
            }
        } catch (error: any) {
            console.error('Login error:', error);
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Error', 
                detail: error.response?.data?.message || 'Failed to login. Please check your credentials.' 
            });
        }
    };

    const isFormFieldValid = (meta: any) => !!(meta.touched && meta.error);
    const getFormErrorMessage = (meta: any) => {
        return isFormFieldValid(meta) && <div className="p-error">{meta.error}</div>;
    };

    return (
        <div className={containerClassName}>
            <Toast ref={toast} />
            <div className="flex flex-column align-items-center justify-content-center">
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="mb-3">
                                <img src={user?.detail_user?.avatar ?? '/layout/images/logo.png'} alt="logo" style={{ height: 'auto', width: '90px', borderRadius: '50%' }} />
                            </div>
                            <div className="text-900 text-3xl font-medium mb-3">Welcome!</div>
                            <span className="text-600 font-medium">Sign in to continue</span>
                        </div>
                        <Form
                            onSubmit={onSubmit}
                            initialValues={{ username: '', password: '' }}
                            validate={validate}
                            render={({ handleSubmit }) => (
                                <form onSubmit={handleSubmit} className="flex flex-column gap-5">
                                    <div>
                                        <Field
                                            name="username"
                                            render={({ input, meta }) => (
                                                <div className="wrap-input relative">
                                                    <label htmlFor="username" className={classNames('block text-900 text-xl font-medium mb-2', { 'p-error': isFormFieldValid(meta) })}>
                                                        Username
                                                    </label>
                                                    <InputText id="username" {...input} autoFocus className={classNames('w-full md:w-30rem mb-5', { 'p-invalid': isFormFieldValid(meta) })} />
                                                    {getFormErrorMessage(meta)}
                                                </div>
                                            )}
                                        />
                                        <Field
                                            name="password"
                                            render={({ input, meta }) => (
                                                <div className="wrap-input relative">
                                                    <label htmlFor="password" className={classNames('block text-900 font-medium text-xl mb-2', { 'p-error': isFormFieldValid(meta) })}>
                                                        Password
                                                    </label>
                                                    <Password id="password" {...input} toggleMask className={classNames('w-full mb-5', { 'p-invalid': isFormFieldValid(meta) })} inputClassName="w-full md:w-30rem" feedback={false} />
                                                    {getFormErrorMessage(meta)}
                                                </div>
                                            )}
                                        />
                                        <div className=""></div>
                                        <GenericButton type="submit" label=" Sign In" className="w-full p-3 text-xl shadow-2" />
                                    </div>
                                </form>
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;