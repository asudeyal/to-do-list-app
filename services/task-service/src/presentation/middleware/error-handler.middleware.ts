import type { ErrorRequestHandler } from "express";

import { InvalidAccessTokenError } from "../../application/errors/invalid-access-token.error.js";
import { DomainError } from "../../domain/errors/domain.error.js";
import { CategoryAlreadyExistsError } from "../../application/errors/category-already-exists.error.js";
import { CategoryNotFoundError } from "../../application/errors/category-not-found.error.js";

export const errorHandler: ErrorRequestHandler = (
    error: unknown,
    _request,
    response,
    _next,
): void => {
    if (error instanceof InvalidAccessTokenError) {
        response.status(401).json({
            error: error.message,
        });
        return;
    }

    if (error instanceof CategoryAlreadyExistsError) {
        response.status(409).json({
            error: error.message,
        });
        return;
    }

    if (error instanceof DomainError) {
        response.status(400).json({
            error: error.message,
        });
        return;
    }

    if (error instanceof CategoryNotFoundError) {
        response.status(404).json({
            error: error.message,
        });
        return;
    }

    console.error(error);

    response.status(500).json({
        error: "Beklenmeyen bir sunucu hatası oluştu.",
    });
};