import { BACKEND_BASE_URL } from "../constants/env";

abstract class BaseService {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_BASE_URL;
  }

  protected async request<T>(path: string, options: RequestInit, isFormData = false): Promise<T> {
    let headers: HeadersInit = options.headers || {};

    // Capture the token at the moment the request is initiated.
    // By the time the response arrives the user may have logged out and back in
    // (new token). We must only fire auth:logout if the token that caused the
    // 401 is still the active session — otherwise stale in-flight requests from
    // old sessions would silently destroy new ones (race condition).
    const tokenAtRequestTime = localStorage.getItem("token");

    if (!isFormData) {
      headers = {
        ...(options.headers as Record<string, string>),
        "Authorization": `Bearer ${tokenAtRequestTime ?? ""}`,
        "Content-Type": "application/json",
      };
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      // Read body first so we can decide which event (if any) to dispatch
      const error = await res.json().catch(() => ({ message: "Request failed" }));
      const isAuthError =
        (res.status === 401 && error?.type === "NO_AUTH") ||
        (res.status === 400 && error?.type === "NO_AUTH");

      if (isAuthError) {
        // Fire logout only if:
        //  1. There was a token when this request started (not a bare unauthenticated call)
        //  2. That token is STILL the current one — if it changed, a new login happened
        //     while this request was in-flight and we must NOT kill the new session.
        const currentToken = localStorage.getItem("token");
        if (tokenAtRequestTime && tokenAtRequestTime === currentToken) {
          window.dispatchEvent(new Event("auth:logout"));
        }
        throw new Error(error.message || "Your session has expired. Please login again.");
      }

      if (res.status === 401) {
        // Non-NO_AUTH 401 — signal without full logout
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
      throw new Error(error.message || "Request failed");
    }

    return res.json() as Promise<T>;
  }
}

export default BaseService;
