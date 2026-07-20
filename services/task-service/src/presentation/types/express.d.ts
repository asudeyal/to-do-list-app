import type { AuthenticatedUser } from "../../application/ports/token-verifier.js";

declare global {
    namespace Express {
        interface Request {
            authenticatedUser?: AuthenticatedUser;
        }
    }
}

export {};