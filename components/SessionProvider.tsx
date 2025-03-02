import axiosInstance from '@/utils/axiosInstance';
import axios from 'axios';
import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { useStorageState } from '../hooks/useStorageState';

const AuthContext = createContext<{
  logIn: (username: string, password: string) => Promise<boolean>;
  logOut: () => Promise<boolean>;
  session: string | null;
  isSessionLoading: boolean;
  user: { id: string; username: string } | null;
  isUserLoading: boolean;
}>({
  logIn: async () => false,
  logOut: async () => false,
  session: null,
  isSessionLoading: false,
  user: null,
  isUserLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

const authEndpoint = 'auth/';

export function SessionProvider({ children }: PropsWithChildren) {
  // const [user, setUser] = useState(null);
  const [[isSessionLoading, session], setSession] = useStorageState('session');
  const [[isUserLoading, user], setUser] = useStorageState('user');

  const logIn = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.post(authEndpoint + "login/", {
        "username": username,
        "password": password,
      });

      if (response.status === 200) {
        const data = response.data;
        setUser(JSON.stringify(data.user));
        setSession(data.token);
        return true;
      } else {
        console.error('Login failed:', response.statusText);
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Login error:', error.response.data);
      } else {
        console.error('Login error:', error);
      }
      return false;
    }
  };

  const logOut = async (): Promise<boolean> => {
    try {
      // Call the logout endpoint
      const response = await axiosInstance.post(authEndpoint + "logout/");
      if (response.status === 200) {
        setUser(null);
        setSession(null);
        return true;
      } else {
        console.error(
          `Logout failed with status ${response.statusText}:`,
          response
        );
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Logout error:', error.response.data);
      } else {
        console.error('Logout error:', error);
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        logIn,
        logOut,
        session: session,
        isSessionLoading: isSessionLoading,
        user: user ? JSON.parse(user) : null,
        isUserLoading: isUserLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
