import type { Request, Response } from "express";

export function getHealth(
    _request: Request,
    response: Response,
): void {
    response.status(200).json({
        status: "ok",
        message: "To-Do List API çalışıyor.",
        timestamp: new Date().toISOString(),
    });
}