import type { Request, Response } from "express";

export function getHealth(
    _request: Request,
    response: Response,
): void {
    response.status(200).json({
        status: "ok",
        message: "Task Service çalışıyor.",
        timestamp: new Date().toISOString(),
    });
}