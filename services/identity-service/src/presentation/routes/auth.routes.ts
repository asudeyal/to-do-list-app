import { Router } from "express";

import type { AuthController } from "../controllers/auth.controller.js";

export function createAuthRouter(
    authController: AuthController,
): Router {
    const authRouter = Router();

    authRouter.post("/register", authController.register);
    authRouter.post("/login", authController.login);

    return authRouter;
}