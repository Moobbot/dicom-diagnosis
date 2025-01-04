import { log } from 'node:console';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Base } from '@/types/base';

// Định nghĩa kiểu UserContext
interface UserContextType {
  user: Base.User | null; // User hoặc null nếu chưa đăng nhập
  setUser: React.Dispatch<React.SetStateAction<Base.User | null>>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Base.User | null>(null);
  const isAuthenticated = !!user;

  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};