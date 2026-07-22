import type { AuthUser } from "../types/auth";

const TOKEN_KEY = "taskflow_access_token";
const USER_KEY = "taskflow_user";

export function saveAuthSession(
    accessToken: string,
    user: AuthUser,
    remember: boolean,
): void {
    clearAuthSession();

    const storage = remember
        ? localStorage
        : sessionStorage;

    storage.setItem(TOKEN_KEY, accessToken);
    storage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken(): string | null {
    return (
        sessionStorage.getItem(TOKEN_KEY) ??
        localStorage.getItem(TOKEN_KEY)
    );
}

export function getStoredUser(): AuthUser | null {
    const storage = sessionStorage.getItem(TOKEN_KEY)
        ? sessionStorage
        : localStorage;

    const storedUser = storage.getItem(USER_KEY);

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser) as AuthUser;
    } catch {
        clearAuthSession();
        return null;
    }
}

export function clearAuthSession(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}