import express from "express";
import { createTaskRouter } from "./presentation/routes/task.routes.js";
import {
    authenticationMiddleware,
    categoryController,
    taskController,
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

app.use(
    "/api/tasks",
    createTaskRouter(
        taskController,
        authenticationMiddleware,
    ),
);

app.use(errorHandler);

export default app;