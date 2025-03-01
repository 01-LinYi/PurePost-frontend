import axiosInstance from '@/utils/axiosInstance';
import axios from 'axios';
import { createContext, useContext, type PropsWithChildren } from 'react';
import { useStorageState } from '../hooks/useStorageState';

const AuthContext = createContext<{
  logIn: (username: string, password: string) => Promise<boolean>;
  logOut: () => Promise<boolean>;
  session?: string | null;
  isSessionLoading: boolean;
}>({
  logIn: async () => false,
  logOut: async () => false,
  session: null,
  isSessionLoading: false,
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

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isSessionLoading, session], setSession] = useStorageState('session');
  const authEndpoint = 'auth/';

  const logIn = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.post(authEndpoint + "login/", {
        "username": username,
        "password": password,
      });

      if (response.status === 200) {
        const data = response.data;
        setSession(data.token); // Assuming the token is returned in the response
        return true;
      } else {
        console.error('Login failed:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logOut = async (): Promise<boolean> => {
    try {
      // Call the logout endpoint
      const response = await axiosInstance.post(authEndpoint + "logout/");
      if (response.status === 200) {
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
        console.error('Login error:', error.response.data);
      } else {
        console.error('Login error:', error);
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        logIn,
        logOut,
        session,
        isSessionLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
