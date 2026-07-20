export interface AuthenticatedUser {
    userId: string;
    email: string;
}

export interface TokenVerifier {
    verify(token: string): Promise<AuthenticatedUser>;
}