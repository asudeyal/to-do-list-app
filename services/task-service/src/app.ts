import express from "express";

import {
    authenticationMiddleware,
    categoryController,
} from "./composition-root.js";
import { errorHandler } from "./presentation/middleware/error-handler.middleware.js";
import { createCategoryRouter } from "./presentation/routes/category.routes.js";
import healthRouter from "./presentation/routes/health.routes.js";

const app = express();

app.use(express.json());

app.use("/api/health", healthRouter);

app.use(
    "/api/categories",
    createCategoryRouter(
        categoryController,
        authenticationMiddleware,
    ),
);

app.use(errorHandler);

export default app;