export interface AccessTokenPayload {
    userId: string;
    email: string;
}

export interface TokenGenerator {
    generate(payload: AccessTokenPayload): Promise<string>;
}