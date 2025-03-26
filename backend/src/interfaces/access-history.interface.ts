export interface IMiscellany {
    status: number;
    request_body?: any;
    message?: string;
}

export interface IAccessHistory {
    username: string;
    api: string;
    http_method: string;
    function_name?: string;
    ip_address: string;
    device_name?: string;
    device_model?: string;
    device_type?: string;
    os_name?: string;
    os_ver?: string;
    os_type?: string;
    browser_name?: string;
    browser_ver?: string;
    browser_type?: string;
    miscellany: IMiscellany;
    created_at: Date;
    updated_at: Date;
}
