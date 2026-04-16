import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'seller';
  password?: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  removeUser: (id: string) => void;
}

const defaultUsers: User[] = [
  { id: '1', username: 'admin', name: 'Administrador', role: 'admin', password: 'admin' },
  { id: '2', username: 'vendedor1', name: 'Juan Vendedor', role: 'seller', password: '123' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('app-auth-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('app-users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('app-auth-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('app-auth-user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('app-users', JSON.stringify(users));
  }, [users]);

  const login = (username: string, password?: string) => {
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const addUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, removeUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
