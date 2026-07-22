export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string;
    user: AuthUser;
    accessToken: string;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
    user: AuthUser;
}