import axiosInstance from "@/utils/axiosInstance";
import axios from "axios";
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import { useStorageState } from "../hooks/useStorageState";
import { User } from "@/types/userType";

const AuthContext = createContext<{
  logIn: (username: string, password: string) => Promise<boolean>;
  logOut: () => Promise<boolean>;
  deleteAccount: (password: string) => Promise<boolean>;
  setUserVerify: (isVerify: boolean) => void;
  session: string | null;
  isSessionLoading: boolean;
  user: User | null;
  isUserLoading: boolean;
}>({
  logIn: async () => false,
  logOut: async () => false,
  deleteAccount: async () => false,
  setUserVerify: async () => false,
  session: null,
  isSessionLoading: false,
  user: null,
  isUserLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

const authEndpoint = "auth/";

export function SessionProvider({ children }: PropsWithChildren) {
  // const [user, setUser] = useState(null);
  const [[isSessionLoading, session], setSession] = useStorageState("session");
  const [[isUserLoading, user], setUser] = useStorageState("user");
  const [jsonUser, setJsonUser] = useState<User | null>(null);

  const logIn = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      setSession(null); // ensure axiosInstance doesn't add session into request
      const response = await axiosInstance.post(authEndpoint + "login/", {
        username: username,
        password: password,
      });

      if (response.status === 200) {
        const data = response.data;
        setJsonUser(data.user);
        setUser(JSON.stringify(data.user));
        setSession(data.token);
        return true;
      } else {
        console.error("Login failed:", response.statusText);
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Login error:", error.response.data);
      } else {
        console.error("Login error:", error);
      }
      return false;
    }
  };

  const logOut = async (): Promise<boolean> => {
    try {
      // Call the logout endpoint
      const response = await axiosInstance.post(authEndpoint + "logout/");
      if (response.status === 200) {
        setJsonUser(null);
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
        console.error("Logout error:", error.response.data);
      } else {
        console.error("Logout error:", error);
      }
      return false;
    }
  };

  const deleteAccount = async (password: string): Promise<boolean> => {
    try {

      if (!user) {
        console.error("No user is logged in");
        return false;
      }


      const response = await axiosInstance.post(
        authEndpoint + "delete-account/",
        {
          password: password,
        }
      );

      if (response.status === 200 || response.status === 204) {
        setJsonUser(null);
        setUser(null);
        setSession(null);
        return true;
      } else {
        console.error(
          `Account deletion failed with status ${response.statusText}:`,
          response
        );
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          console.error("Account deletion failed: Incorrect password");
        } else {
          console.error("Account deletion error:", error.response.data);
        }
      } else {
        console.error("Account deletion error:", error);
      }
      return false;
    }
  };

  const setUserVerify = (isVerify: boolean = true) => {
    if (!jsonUser) {
      return;
    }

    jsonUser.is_verified = isVerify;
    setJsonUser(jsonUser);
    setUser(JSON.stringify(jsonUser));
  }

  return (
    <AuthContext.Provider
      value={{
        logIn,
        logOut,
        deleteAccount,
        setUserVerify,
        session: session,
        isSessionLoading: isSessionLoading,
        user: jsonUser,
        isUserLoading: isUserLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
