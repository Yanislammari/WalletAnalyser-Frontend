import { BACKEND_BASE_URL } from "../constants/env";

abstract class BaseService {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_BASE_URL;
  }

  protected async request<T>(path: string, options: RequestInit, isFormData = false): Promise<T> {
    let headers: HeadersInit = options.headers || {};
    if (!isFormData) {
      headers = {
        ...(options.headers as Record<string, string>),
        "Authorization" : `Bearer ${localStorage.getItem("token") ?? ""}`,
        "Content-Type": "application/json",
      };
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Request failed" }));
      const isAuthError =
        (res.status === 401 && error?.type === "NO_AUTH") ||
        (res.status === 400 && error?.type === "NO_AUTH")
      const isSuvbscribeError = 
        (res.status === 401 && error?.type === "NOT_SUBSCRIBE") ||
        (res.status === 400 && error?.type === "NOT_SUBSCRIBE")
      if (isAuthError) {
        window.dispatchEvent(new Event("auth:logout"));
        throw new Error(error.message || "Your session has expired. Please login again.");
      } else if (isSuvbscribeError) {
        throw new Error(error.message || "You need to subscribe to access this feature.");
      }
      throw new Error(error.message || "Request failed");
    }

    return res.json() as Promise<T>;
  }
}

export default BaseService;
