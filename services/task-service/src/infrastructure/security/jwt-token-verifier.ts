import { jwtVerify } from "jose";

import { InvalidAccessTokenError } from "../../application/errors/invalid-access-token.error.js";
import type {
    AuthenticatedUser,
    TokenVerifier,
} from "../../application/ports/token-verifier.js";

interface JwtTokenVerifierConfig {
    secret: string;
    issuer: string;
    audience: string;
}

export class JwtTokenVerifier implements TokenVerifier {
    private readonly secretKey: Uint8Array;

    constructor(
        private readonly config: JwtTokenVerifierConfig,
    ) {
        this.secretKey = new TextEncoder().encode(config.secret);
    }

    async verify(token: string): Promise<AuthenticatedUser> {
        try {
            const { payload } = await jwtVerify(
                token,
                this.secretKey,
                {
                    issuer: this.config.issuer,
                    audience: this.config.audience,
                    algorithms: ["HS256"],
                },
            );

            if (
                typeof payload.sub !== "string" ||
                typeof payload.email !== "string"
            ) {
                throw new InvalidAccessTokenError();
            }

            return {
                userId: payload.sub,
                email: payload.email,
            };
        } catch (error: unknown) {
            if (error instanceof InvalidAccessTokenError) {
                throw error;
            }

            throw new InvalidAccessTokenError();
        }
    }
}