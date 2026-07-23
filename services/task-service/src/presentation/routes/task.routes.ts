import {
    Router,
    type RequestHandler,
    type Router as ExpressRouter,
} from "express";

import type { TaskController } from "../controllers/task.controller.js";

export function createTaskRouter(
    taskController: TaskController,
    authenticate: RequestHandler,
): ExpressRouter {
    const router = Router();

    router.use(authenticate);

    router.get("/", taskController.list);
    router.post("/", taskController.create);

    router.patch(
        "/:id/status",
        taskController.changeStatus,
    );

    router.patch(
        "/:id",
        taskController.update,
    );

    router.delete(
        "/:id",
        taskController.remove,
    );

    return router;
}