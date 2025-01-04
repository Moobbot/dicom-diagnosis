export interface INotification {
    id: number;
    avatar: string;
    username: string;
    action: string;
    content: string;
    location: string;
    timestamp: string;
    isRead?: boolean;
}
