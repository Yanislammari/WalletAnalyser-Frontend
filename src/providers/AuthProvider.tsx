import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { UserResponse } from "../responses/UserResponse";
import type { User } from "../models/User";
import AuthService from "../services/AuthService";
import SubscriptionService from "../services/SubscriptionService";
import type { RegisterPayload } from "../payloads/RegisterPayload";
import type { AuthResponse } from "../responses/AuthResponse";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isPro: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  logout: () => void;
  sendActivationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateLocalUser: (userResponse: UserResponse) => void;
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
  subscribe: userResponse.subscribe ?? false,
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
  const subscriptionService = SubscriptionService.getInstance();
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
  const isPro: boolean = user?.subscribe ?? false;

  // Always-fresh ref to the current location so logout() never reads a stale closure value
  const locationRef = useRef(location);
  useEffect(() => { locationRef.current = location; }, [location]);

  // Re-sync subscription status from server when user is authenticated
  useEffect(() => {
    if (!token) return;
    subscriptionService.getStatus()
      .then((status) => {
        setUser((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, subscribe: status.isPro };
          localStorage.setItem("user", JSON.stringify(updated));
          return updated;
        });
      })
      .catch(() => {});
  }, [token]);

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
        // Non-fatal: if the email service is down the user is still logged in
        try { await authService.sendActivationEmail(mappedUser.email); } catch { /* ignore */ }
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
        // Non-fatal: if the email service is down the user is still registered
        try { await authService.sendActivationEmail(mappedUser.email); } catch { /* ignore */ }
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
        // Non-fatal: Google already verified the email, user is logged in regardless
        try { await authService.sendActivationEmail(mappedUser.email); } catch { /* ignore */ }
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
    // Guard: if there is no token at all there is nothing to log out from.
    // This prevents a spurious "session expired" flow triggered by a request
    // that went out without a token (e.g. during the registration flow before
    // localStorage was populated).
    if (!localStorage.getItem("token")) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("justLoggedIn");
    sessionStorage.removeItem("showActivationBanner");
    setUser(null);
    setToken(null);
    setIsAuthLoading(false);

    const PUBLIC_PATHS = ["/", "/main", "/login", "/register"];
    // Use locationRef.current so we always read the live pathname, not a stale closure value
    if (!PUBLIC_PATHS.includes(locationRef.current.pathname)) {
      toast.info("Your session has expired please login again");
      navigate("/login", { replace: true, state: { from: locationRef.current } });
    }
  }, [navigate]); // navigate is stable; locationRef.current is always fresh via the effect above

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);

  const updateLocalUser = useCallback((userResponse: UserResponse) => {
    const mappedUser = mapUserResponseToUser(userResponse);
    setUser(mappedUser);
    localStorage.setItem("user", JSON.stringify(mappedUser));
  }, []);

  // Refresh subscription status from backend (called after Stripe redirect)
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const status = await subscriptionService.getStatus();
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, subscribe: status.isPro };
        localStorage.setItem("user", JSON.stringify(updated));
        return updated;
      });
    } catch {
      // ignore
    }
  }, [token, subscriptionService]);

  // Auto-logout on 401: any service dispatches "auth:unauthorized" when the
  // token is rejected by the backend. We catch it here and call logout().
  useEffect(() => {
    const handle = () => logout();
    window.addEventListener("auth:unauthorized", handle);
    return () => window.removeEventListener("auth:unauthorized", handle);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAuthLoading, isPro, login, register, loginWithGoogle, logout, sendActivationEmail, refreshUser, updateLocalUser }}>
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
