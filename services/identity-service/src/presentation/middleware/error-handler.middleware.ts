import type { ErrorRequestHandler } from "express";

import { EmailAlreadyInUseError } from "../../application/errors/email-already-in-use.error.js";
import { DomainError } from "../../domain/errors/domain.error.js";
import { InvalidCredentialsError } from "../../application/errors/invalid-credentials.error.js";

export const errorHandler: ErrorRequestHandler = (
    error: unknown,
    _request,
    response,
    _next,
): void => {
    if (error instanceof DomainError) {
        response.status(400).json({
            error: error.message,
        });
        return;
    }

    if (error instanceof EmailAlreadyInUseError) {
        response.status(409).json({
            error: error.message,
        });
        return;
    }

    if (error instanceof InvalidCredentialsError) {
        response.status(401).json({
            error: error.message,
        });
        return;
    }

    console.error(error);

    response.status(500).json({
        error: "Beklenmeyen bir sunucu hatası oluştu.",
    });
};