import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useContext,
} from "react";
import type { User } from "../types";
import apiService from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saveToken = localStorage.getItem("token");
    const saveUser = localStorage.getItem("user");

    if (saveToken && saveUser) {
      setToken(saveToken);
      setUser(JSON.parse(saveUser));
    }
    setLoading(false);
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await apiService.signup(name, email, password);

      const { user: userInfo, token: jwtToken } = response.data;

      setUser(userInfo);
      setToken(jwtToken);

      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(userInfo));
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      const { user: userInfo, token: jwtToken } = response.data;

      setUser(userInfo);
      setToken(jwtToken);
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(userInfo));
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const authValues: AuthContextType = {
    user,
    token,
    loading,
    signup,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>
  );
};

//Custom Hook to Access Auth

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};
