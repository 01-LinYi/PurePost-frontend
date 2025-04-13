import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import { useStorageState } from "../hooks/useStorageState";
import { User } from "@/types/userType";
import { login, logout, deleteAccount as deleteAccountApi } from "@/utils/api";
import { LoginResponse } from "@/types/authType";

const AuthContext = createContext<{
  logIn: (username: string, password: string) => Promise<string | null>;
  logOut: () => Promise<string | null>;
  deleteAccount: (password: string) => Promise<string | null>;
  setUserVerify: (isVerify: boolean) => void;
  session: string | null;
  isSessionLoading: boolean;
  user: User | null;
  isUserLoading: boolean;
}>({
  logIn: async () => null,
  logOut: async () => null,
  deleteAccount: async () => null,
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
  ): Promise<string | null> => {
    setSession(null); // ensure axiosInstance doesn't add session into request
    const res: LoginResponse = await login(username, password);
    if (res.error) {
      return res.error;
    }

    setJsonUser(res.user);
    setUser(JSON.stringify(res.user));
    setSession(res.token);
    return null;
  };

  const logOut = async (): Promise<string | null> => {
    const error = await logout();
    // Silently handle the error
    if (error) {
      console.error("Error logging out: ", error);
    }

    setJsonUser(null);
    setUser(null);
    setSession(null);
    return null;
  };

  const deleteAccount = async (password: string): Promise<string | null> => {
    if (!user) {
      console.error("No user is logged in");
      return "An error occurred while deleting the account.";
    }

    const error = await deleteAccountApi(password);
    if (!error) {
      setJsonUser(null);
      setUser(null);
      setSession(null);
      return null;
    }

    return error;
  };

  const setUserVerify = (isVerify: boolean = true) => {
    if (!jsonUser) {
      return;
    }

    jsonUser.isVerified = isVerify;
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
