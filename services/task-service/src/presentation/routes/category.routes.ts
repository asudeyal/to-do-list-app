import {
    Router,
    type RequestHandler,
} from "express";

import type { CategoryController } from "../controllers/category.controller.js";

export function createCategoryRouter(
    categoryController: CategoryController,
    authenticationMiddleware: RequestHandler,
): Router {
    const categoryRouter = Router();

    categoryRouter.post(
        "/",
        authenticationMiddleware,
        categoryController.create,
    );

    return categoryRouter;
}