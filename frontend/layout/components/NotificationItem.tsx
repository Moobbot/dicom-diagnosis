import React from 'react';
import { Avatar } from 'primereact/avatar';
import { INotification } from '@/types/noti';

interface NotificationItemProps {
    notification: INotification;
}
interface NotificationItemStyles {
    item: React.CSSProperties;
    avatar: React.CSSProperties;
    content: React.CSSProperties;
    text: React.CSSProperties;
    username: React.CSSProperties;
    timestamp: React.CSSProperties;
    status: React.CSSProperties;
    unreadIndicator: React.CSSProperties;
}
const styles: NotificationItemStyles = {
    item: {
        display: 'flex',
        alignItems: 'flex-start',
        padding: '1rem',
        borderBottom: '1px solid #eee'
    },
    avatar: {
        marginRight: '1rem'
    },
    content: {
        flex: 1
    },
    text: {
        marginBottom: '0.5rem'
    },
    username: {
        fontWeight: 'bold',
        marginRight: '0.5rem'
    },
    timestamp: {
        color: '#666',
        fontSize: '0.875rem'
    },
    status: {
        display: 'flex',
        alignItems: 'center'
    },
    unreadIndicator: {
        width: '8px',
        height: '8px',
        backgroundColor: '#2196f3',
        borderRadius: '50%',
        display: 'block'
    }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    return (
        <div style={styles.item}>
            <Avatar image={notification.avatar} shape="circle" size="normal" style={styles.avatar} />
            <div style={styles.content}>
                <div style={styles.text}>
                    <span style={styles.username}>{notification.username}</span>
                    <span style={{ marginRight: '0.5rem' }}>{notification.action}</span>
                    <span style={{ marginRight: '0.5rem' }}>{notification.content}</span>
                    <span>{notification.location}</span>
                </div>
                <div style={styles.timestamp}>{notification.timestamp}</div>
            </div>
            <div style={styles.status}>{!notification.isRead && <span style={styles.unreadIndicator} />}</div>
        </div>
    );
};

export default NotificationItem;
