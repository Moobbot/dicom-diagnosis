import { Base } from '@/types';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type User = Base.LoggedInUser;

const UserContext = createContext<{
    user: User | null;
    setUser: (user: User | null) => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}>({
    user: null,
    setUser: () => {},
    isAuthenticated: false,
    isLoading: true
});

export const useUserContext = () => {
    const context = useContext(UserContext);
    return context;
};

export default function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(() => null);
    const isAuthenticated = Boolean(user);
    const [isLoading, setIsLoading] = useState(true);
    const setUser = useCallback(
        (user: User | null) => {
            setUserState(user);
            localStorage.setItem('user', JSON.stringify(user));
            setIsLoading(false);
        },
        [setUserState]
    );

    useEffect(() => {
        const _user = localStorage.getItem('user');
        setUserState(_user ? JSON.parse(_user) : null);
    }, [setUserState]);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                isAuthenticated,
                isLoading
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
