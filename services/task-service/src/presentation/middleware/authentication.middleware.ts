import type { RequestHandler } from "express";

import { InvalidAccessTokenError } from "../../application/errors/invalid-access-token.error.js";
import type { TokenVerifier } from "../../application/ports/token-verifier.js";

export function createAuthenticationMiddleware(
    tokenVerifier: TokenVerifier,
): RequestHandler {
    return async (request, _response, next): Promise<void> => {
        try {
            const authorizationHeader =
                request.header("authorization");

            if (!authorizationHeader) {
                throw new InvalidAccessTokenError();
            }

            const [scheme, token] =
                authorizationHeader.split(" ");

            if (
                scheme?.toLowerCase() !== "bearer" ||
                !token
            ) {
                throw new InvalidAccessTokenError();
            }

            request.authenticatedUser =
                await tokenVerifier.verify(token);

            next();
        } catch (error: unknown) {
            next(error);
        }
    };
}
