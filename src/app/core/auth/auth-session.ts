export interface AuthSessionUser {
    id: number;
    name: string;
    username: string;
    email: string;
    language: string;
    idCompany: number;
    idEntity: number;
    team: string;
    userLevel: number;
    pwd_last_change?: number;
    sessionId?: string;
}

export interface AuthSessionPayload {
    user: AuthSessionUser;
    accessToken: string;
    refreshToken: string;
}

const AUTH_USER_KEY = 'auth_user';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function setStoredAuthSession(payload: AuthSessionPayload): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload.user));
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
}

export function clearStoredAuthSession(): void {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getStoredAuthUser(): AuthSessionUser | null {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as AuthSessionUser;
    } catch {
        return null;
    }
}

export function getSessionCompanyId(): number {
    return Number(getStoredAuthUser()?.idCompany ?? 0);
}

export function getSessionEntityId(): number {
    return Number(getStoredAuthUser()?.idEntity ?? 0);
}

export function getSessionUserId(): number {
    return Number(getStoredAuthUser()?.id ?? 0);
}

export function getSessionTeam(): string {
    return String(getStoredAuthUser()?.team ?? '');
}

export function getSessionLevelUser(): number {
    return Number(getStoredAuthUser()?.userLevel ?? 0);
}

export function getSessionUserName(): string {
    return String(getStoredAuthUser()?.name ?? '');
}
