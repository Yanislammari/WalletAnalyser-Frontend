import type { LoginPayload } from "../payloads/LoginPayload";
import type { RegisterPayload } from "../payloads/RegisterPayload";
import type { AuthResponse } from "../responses/AuthResponse";
import { BaseService } from "./BaseService";

class AuthService extends BaseService {
  private static instance: AuthService;

  private constructor() {
    super();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(payload: LoginPayload): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async register(payload: RegisterPayload): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async authWithGoogle(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  public async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    return this.request<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`, {
      method: "POST",
    });
  }

  public async sendPasswordReset(email: string): Promise<void> {
    await this.request("/auth/send-reset-password-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }
}

export default AuthService;
