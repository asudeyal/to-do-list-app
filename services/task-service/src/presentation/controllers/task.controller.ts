import type {
    NextFunction,
    Request,
    Response,
} from "express";

import type { TaskOutput } from "../../application/dtos/task-output.js";
import type {
    CreateTaskInput,
    CreateTaskUseCase,
} from "../../application/use-cases/create-task.use-case.js";
import type { ListTasksUseCase } from "../../application/use-cases/list-tasks.use-case.js";
import { InvalidAccessTokenError } from "../../application/errors/invalid-access-token.error.js";
import type { TaskPriority } from "../../domain/entities/task.js";

interface CreateTaskRequestBody {
    title?: unknown;
    description?: unknown;
    priority?: unknown;
    dueDate?: unknown;
    categoryId?: unknown;
}

function isTaskPriority(value: unknown): value is TaskPriority {
    return (
        value === "low" ||
        value === "medium" ||
        value === "high"
    );
}

function serializeTask(task: TaskOutput) {
    return {
        ...task,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
    };
}

export class TaskController {
    constructor(
        private readonly createTaskUseCase: CreateTaskUseCase,
        private readonly listTasksUseCase: ListTasksUseCase,
    ) {}

    create = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const authenticatedUser = request.authenticatedUser;

            if (!authenticatedUser) {
                throw new InvalidAccessTokenError();
            }

            const body = request.body as CreateTaskRequestBody;

            if (typeof body.title !== "string") {
                response.status(400).json({
                    error: "Görev başlığı zorunludur.",
                });
                return;
            }

            if (
                body.description !== undefined &&
                body.description !== null &&
                typeof body.description !== "string"
            ) {
                response.status(400).json({
                    error: "Açıklama metin veya null olmalıdır.",
                });
                return;
            }

            if (
                body.priority !== undefined &&
                !isTaskPriority(body.priority)
            ) {
                response.status(400).json({
                    error: "Öncelik low, medium veya high olmalıdır.",
                });
                return;
            }

            if (
                body.dueDate !== undefined &&
                body.dueDate !== null &&
                typeof body.dueDate !== "string"
            ) {
                response.status(400).json({
                    error: "Son tarih metin veya null olmalıdır.",
                });
                return;
            }

            if (
                body.categoryId !== undefined &&
                body.categoryId !== null &&
                typeof body.categoryId !== "string"
            ) {
                response.status(400).json({
                    error: "Kategori kimliği metin veya null olmalıdır.",
                });
                return;
            }

            const input: CreateTaskInput = {
                ownerId: authenticatedUser.userId,
                title: body.title,
                ...(body.description !== undefined
                    ? { description: body.description as string | null }
                    : {}),
                ...(body.priority !== undefined
                    ? { priority: body.priority }
                    : {}),
                ...(body.dueDate !== undefined
                    ? { dueDate: body.dueDate as string | null }
                    : {}),
                ...(body.categoryId !== undefined
                    ? { categoryId: body.categoryId as string | null }
                    : {}),
            };

            const task = await this.createTaskUseCase.execute(input);

            response.status(201).json({
                message: "Görev başarıyla oluşturuldu.",
                task: serializeTask(task),
            });
        } catch (error: unknown) {
            next(error);
        }
    };

    list = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const authenticatedUser = request.authenticatedUser;

            if (!authenticatedUser) {
                throw new InvalidAccessTokenError();
            }

            const tasks = await this.listTasksUseCase.execute(
                authenticatedUser.userId,
            );

            response.status(200).json({
                tasks: tasks.map(serializeTask),
            });
        } catch (error: unknown) {
            next(error);
        }
    };
}