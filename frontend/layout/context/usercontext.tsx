import { Base } from '@/types';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type User = Base.LoggedInUser;

const UserContext = createContext<{
    user: User | null;
    setUser: (user: User | null) => void;
    isAuthenticated: boolean;
}>({
    user: null,
    setUser: () => {},
    isAuthenticated: false
});

export const useUserContext = () => {
    const context = useContext(UserContext);
    return context;
};

export default function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(() => null);
    const isAuthenticated = Boolean(user);
    const setUser = useCallback(
        (user: User | null) => {
            setUserState(user);
            localStorage.setItem('user', JSON.stringify(user));
        },
        [setUserState]
    );

    useEffect(() => {
        const _user = localStorage.getItem('user');
        setUserState(_user ? JSON.parse(_user) : null);
    }, [setUserState]);

    if (!user) {
        return null;
    }

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                isAuthenticated
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
