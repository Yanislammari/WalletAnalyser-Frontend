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
        "Content-Type": "application/json",
      };
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || "Request failed");
    }

    return res.json() as Promise<T>;
  }
}

export default BaseService;
