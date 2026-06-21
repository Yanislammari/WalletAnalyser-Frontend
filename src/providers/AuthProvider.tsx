import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { UserResponse } from "../responses/UserResponse";
import type { User } from "../models/User";
import AuthService from "../services/AuthService";
import type { RegisterPayload } from "../payloads/RegisterPayload";
import type { AuthResponse } from "../responses/AuthResponse";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  logout: () => void;
  sendActivationEmail: () => Promise<void>;
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
  activated: userResponse.activated,
  timeMsGift: userResponse.timeMsGift,
  createdAt: new Date(userResponse.createdAt),
  updatedAt: new Date(userResponse.updatedAt),
});

const AuthContext: React.Context<AuthContextType | undefined> = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = (props: AuthProviderProps) => {
  const authService = AuthService.getInstance();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored: string | null = localStorage.getItem("user");
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
      } as User;
    }
    catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const isAuthenticated: boolean = !!token;

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      const mappedUser = mapUserResponseToUser(response.user);

      setToken(response.token);
      setUser(mappedUser);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      sessionStorage.setItem("justLoggedIn", "true");
      sessionStorage.setItem("showActivationBanner", "true");

      if (!mappedUser.activated) {
        await authService.sendActivationEmail(mappedUser.email);
      }
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
      sessionStorage.setItem("justLoggedIn", "true");
      sessionStorage.setItem("showActivationBanner", "true");

      if (!mappedUser.activated) {
        await authService.sendActivationEmail(mappedUser.email);
      }

      return mappedUser;
    }
    catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  }, [authService]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    setIsAuthLoading(true);

    try {
      const response: AuthResponse = await authService.authWithGoogle(idToken);
      const mappedUser: User = mapUserResponseToUser(response.user);

      setToken(response.token);
      setUser(mappedUser);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      sessionStorage.setItem("justLoggedIn", "true");
      sessionStorage.setItem("showActivationBanner", "true");

      if (!mappedUser.activated) {
        await authService.sendActivationEmail(mappedUser.email);
      }

      return mappedUser;
    }
    catch (error: any) {
      setIsAuthLoading(false);
      throw new Error(error.message || "Google login failed");
    }
  }, [authService]);

  const sendActivationEmail = useCallback(async () => {
    if (!user) {
      return;
    }

    await authService.sendActivationEmail(user.email);
  }, [authService, user]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthLoading(false);
    const PUBLIC_PATHS = ["/", "/main", "/login", "/register"];
    console.log(location.pathname)
    console.log(!PUBLIC_PATHS.includes(location.pathname))
    if (!PUBLIC_PATHS.includes(location.pathname)) {
      toast.info("Your session has expired please login again")
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("justLoggedIn");
      sessionStorage.removeItem("showActivationBanner");
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, []);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAuthLoading, login, register, loginWithGoogle, logout, sendActivationEmail }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context: AuthContextType | undefined = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
