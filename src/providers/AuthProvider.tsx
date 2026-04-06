import React, { createContext, useContext, useState, useCallback } from "react";
import type { UserResponse } from "../responses/UserResponse";
import type { User } from "../models/User";
import AuthService from "../services/AuthService";
import type { RegisterPayload } from "../payloads/RegisterPayload";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
}

const mapUserResponseToUser = (userResponse: UserResponse): User => ({
  id: userResponse.id,
  email: userResponse.email,
  firstName: userResponse.firstName,
  lastName: userResponse.lastName,
  googleId: userResponse.googleId,
  googlePictureUrl: userResponse.googlePictureUrl,
  ban: userResponse.ban,
  userType: userResponse.userType,
  subscribe: false,
  createdAt: new Date(userResponse.createdAt),
  updatedAt: new Date(userResponse.updatedAt),  
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authService = AuthService.getInstance();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const isAuthenticated = !!token;

  const login = useCallback(async (email: string, password: string) => {
    try {
      const payload = { email, password };
      const response = await authService.login(payload);

      setToken(response.token);
      setUser(mapUserResponseToUser(response.user));

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(mapUserResponseToUser(response.user)));
    }
    catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  }, [authService]);

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      const response = await authService.register(payload);
      const mappedUser = mapUserResponseToUser(response.user);

      setToken(response.token);
      setUser(mappedUser);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(mappedUser));

      return mappedUser;
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  }, [authService]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
