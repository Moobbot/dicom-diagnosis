/* FullCalendar Types */
import { EventApi, EventInput } from '@fullcalendar/core';

/* Chart.js Types */
import { ChartData, ChartOptions } from 'chart.js';
// General Types
export type InventoryStatus = 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK';
export type Status = 'DELIVERED' | 'PENDING' | 'RETURNED' | 'CANCELLED';
export type LayoutType = 'list' | 'grid';
export type SortOrderType = 1 | 0 | -1;

// Common Interfaces
export interface CustomEvent {
    name?: string;
    status?: 'Ordered' | 'Processing' | 'Shipped' | 'Delivered';
    date?: string;
    color?: string;
    icon?: string;
    image?: string;
}

export interface ChartDataState {
    barData?: ChartData;
    pieData?: ChartData;
    lineData?: ChartData;
    polarData?: ChartData;
    radarData?: ChartData;
}
export interface ChartOptionsState {
    barOptions?: ChartOptions;
    pieOptions?: ChartOptions;
    lineOptions?: ChartOptions;
    polarOptions?: ChartOptions;
    radarOptions?: ChartOptions;
}

interface ShowOptions {
    severity?: string;
    content?: string;
    summary?: string;
    detail?: string;
    life?: number;
}

declare namespace Base {
    /** ------------ User Management ------------ */

    interface Role {
        status: boolean;
        permissions: any;
        grantAll: any;
        _id: string;
        name: string;
    }

    interface Permission {
        _id(_id: any): boolean;
        name: string;
    }

    interface Permissions {
        [key: string]: boolean;
    }

    interface CreatedBy {
        _id: string;
        username: string;
    }

    interface UpdatedBy {
        _id: string;
        username: string;
    }

    // Định nghĩa kiểu Document cho detail_user
    interface DetailUser {
        user_code: string;
        name: string;
        avatar: string | null;
        birth_date: string; // ISODate hoặc string (tùy cách sử dụng)
        address: string;
        gender: number; // Có thể là "male", "female", hoặc giá trị khác
    }
    export interface User {
        _id: string;
        username: string;
        password: string; // Mã hóa
        roles: Role[];
        createdBy: CreatedBy | null;
        updatedBy: UpdatedBy | null;
        status: boolean;
        createdAt: string; // ISODate
        updatedAt: string; // ISODate
        detail_user: DetailUser;
    }

    export interface LoggedInUser {
        _id: string;
        username: string;
        grantAll: boolean;
        permissions: string[];
        detail_user: DetailUser;
    }

    type UserStatus = 'active' | 'inactive';

    type UserProfile = {
        userId: number;
        bio: string;
        website: string;
        location: string;
        [key: string]: string | number | undefined;
    };

    type UserActivity = {
        userId: number;
        action: string;
        timestamp: number;
        [key: string]: string | number | undefined;
    };

    /** ------------ Task Management ------------ */
    interface Task {
        id?: number;
        name?: string;
        description?: string;
        completed?: boolean;
        status?: string;
        comments?: string;
        attachments?: string;
        members?: Member[];
        startDate?: string;
        endDate?: string;
    }

    interface Member {
        name: string;
        image: string;
    }

    interface DialogConfig {
        visible: boolean;
        header: string;
        newTask: boolean;
    }

    /** ------------ Product Management ------------ */
    //ProductService
    type Product = {
        id?: string;
        code?: string;
        name: string;
        description: string;
        image?: string;
        price?: number;
        category?: string;
        quantity?: number;
        inventoryStatus?: InventoryStatus;
        rating?: number;
        orders?: ProductOrder[];
        [key: string]: string | string[] | number | boolean | undefined | ProductOrder[] | InventoryStatus;
    };

    type ProductOrder = {
        id?: string;
        productCode?: string;
        date?: string;
        amount?: number;
        quantity?: number;
        customer?: string;
        status?: Status;
    };

    type Payment = {
        name: string;
        amount: number;
        paid: boolean;
        date: string;
    };

    interface Mail {
        id: number;
        from: string;
        to: string;
        email: string;
        image: string;
        title: string;
        message: string;
        date: string;
        important: boolean;
        starred: boolean;
        trash: boolean;
        spam: boolean;
        archived: boolean;
        sent: boolean;
    }
    interface Message {
        text: string;
        ownerId: number;
        createdAt: number;
    }

    interface Event extends EventInput {
        location?: string;
        description?: string;
        tag?: {
            name: string;
            color: string;
        };
    }

    /** ------------ Photo Management ------------ */
    // PhotoService
    type Photo = {
        title: string;
        itemImageSrc?: string | undefined;
        thumbnailImageSrc?: string | undefined;
        alt?: string | undefined;
    };

    type Country = {
        name: string;
        code: string;
    };

    /** ------------ Icon Management ------------ */
    // IconService
    type Icon = {
        icon?: {
            paths?: string[];
            attrs?: [{}];
            isMulticolor?: boolean;
            isMulticolor2?: boolean;
            grid?: number;
            tags?: string[];
        };
        attrs?: [{}];
        properties?: {
            order?: number;
            id: number;
            name: string;
            prevSize?: number;
            code?: number;
        };
        setIdx?: number;
        setId?: number;
        iconIdx?: number;
    };
}
