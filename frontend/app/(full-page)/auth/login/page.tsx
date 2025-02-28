'use client';
import { useEffect, useState, useRef } from 'react';
import { Form, Field } from 'react-final-form';
import { useRouter } from 'next/navigation';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useUserContext } from '../../../../layout/context/usercontext';
import AuthService from '../../../../modules/admin/service/AuthService';
import axios, { AxiosError } from 'axios';

const LoginPage = () => {
    const authService = new AuthService();
    const [formData, setFormData] = useState({});
    const [checked, setChecked] = useState(false);
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
            const response = await authService.login(data.username, data.password);
            localStorage.setItem('accessToken', response.accessToken);

            await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(response)
            });

            setUser(response.data);
            router.push('/');
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response?.data.message });
        }
        // form.restart();
    };

    const isFormFieldValid = (meta: any) => !!(meta.touched && meta.error);
    const getFormErrorMessage = (meta: any) => {
        return isFormFieldValid(meta) && <div className="p-error -mt-4 mb-5">{meta.error}</div>;
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
                            <img src={user?.detail_user.avatar ?? '/layout/images/logo.png'} alt="logo" className="mb-3" style={{ height: '80px', width: '80px', borderRadius: '50%' }} />
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
                                                <>
                                                    <label htmlFor="username" className={classNames('block text-900 text-xl font-medium mb-2', { 'p-error': isFormFieldValid(meta) })}>
                                                        Username
                                                    </label>
                                                    <InputText id="username" {...input} autoFocus className={classNames('w-full md:w-30rem mb-5', { 'p-invalid': isFormFieldValid(meta) })} />
                                                    {getFormErrorMessage(meta)}
                                                </>
                                            )}
                                        />

                                        <Field
                                            name="password"
                                            render={({ input, meta }) => (
                                                <>
                                                    <label htmlFor="password" className={classNames('block text-900 font-medium text-xl mb-2', { 'p-error': isFormFieldValid(meta) })}>
                                                        Password
                                                    </label>
                                                    <Password id="password" {...input} toggleMask className={classNames('w-full mb-5', { 'p-invalid': isFormFieldValid(meta) })} inputClassName="w-full p-3 md:w-30rem" feedback={false} />
                                                    {getFormErrorMessage(meta)}
                                                </>
                                            )}
                                        />

                                        <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                            <div className="flex align-items-center">
                                                <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
                                                <label htmlFor="rememberme1">Remember me</label>
                                            </div>
                                            <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                                Forgot password?
                                            </a>
                                        </div>
                                        <Button type="submit" label="Sign In" className="w-full p-3 text-xl"></Button>
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
