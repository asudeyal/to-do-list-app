import { SignJWT } from "jose";

import type {
    AccessTokenPayload,
    TokenGenerator,
} from "../../application/ports/token-generator.js";

interface JwtTokenGeneratorConfig {
    secret: string;
    issuer: string;
    audience: string;
    expiresIn: string;
}

export class JwtTokenGenerator implements TokenGenerator {
    private readonly secretKey: Uint8Array;

    constructor(
        private readonly config: JwtTokenGeneratorConfig,
    ) {
        this.secretKey = new TextEncoder().encode(config.secret);
    }

    async generate(payload: AccessTokenPayload): Promise<string> {
        return new SignJWT({
            email: payload.email,
        })
            .setProtectedHeader({
                alg: "HS256",
                typ: "JWT",
            })
            .setSubject(payload.userId)
            .setIssuer(this.config.issuer)
            .setAudience(this.config.audience)
            .setIssuedAt()
            .setExpirationTime(this.config.expiresIn)
            .sign(this.secretKey);
    }
}