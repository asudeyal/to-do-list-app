import type {
    NextFunction,
    Request,
    Response,
} from "express";

import type { TaskOutput } from "../../application/dtos/task-output.js";
import { InvalidAccessTokenError } from "../../application/errors/invalid-access-token.error.js";
import type { ChangeTaskStatusUseCase } from "../../application/use-cases/change-task-status.use-case.js";
import type {
    CreateTaskInput,
    CreateTaskUseCase,
} from "../../application/use-cases/create-task.use-case.js";
import type { DeleteTaskUseCase } from "../../application/use-cases/delete-task.use-case.js";
import type { ListTasksUseCase } from "../../application/use-cases/list-tasks.use-case.js";
import type {
    UpdateTaskInput,
    UpdateTaskUseCase,
} from "../../application/use-cases/update-task.use-case.js";
import type {
    TaskPriority,
    TaskStatus,
} from "../../domain/entities/task.js";

interface CreateTaskRequestBody {
    title?: unknown;
    description?: unknown;
    priority?: unknown;
    dueDate?: unknown;
    categoryId?: unknown;
}

interface UpdateTaskRequestBody {
    title?: unknown;
    description?: unknown;
    priority?: unknown;
    dueDate?: unknown;
    categoryId?: unknown;
}

interface ChangeTaskStatusRequestBody {
    status?: unknown;
}

function isTaskPriority(
    value: unknown,
): value is TaskPriority {
    return (
        value === "low" ||
        value === "medium" ||
        value === "high"
    );
}

function isTaskStatus(
    value: unknown,
): value is TaskStatus {
    return (
        value === "pending" ||
        value === "in_progress" ||
        value === "completed"
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
        private readonly updateTaskUseCase: UpdateTaskUseCase,
        private readonly changeTaskStatusUseCase:
        ChangeTaskStatusUseCase,
        private readonly deleteTaskUseCase: DeleteTaskUseCase,
    ) {}

    create = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const authenticatedUser =
                request.authenticatedUser;

            if (!authenticatedUser) {
                throw new InvalidAccessTokenError();
            }

            const body =
                request.body as CreateTaskRequestBody;

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
                    error:
                        "Açıklama metin veya null olmalıdır.",
                });
                return;
            }

            if (
                body.priority !== undefined &&
                !isTaskPriority(body.priority)
            ) {
                response.status(400).json({
                    error:
                        "Öncelik low, medium veya high olmalıdır.",
                });
                return;
            }

            if (
                body.dueDate !== undefined &&
                body.dueDate !== null &&
                typeof body.dueDate !== "string"
            ) {
                response.status(400).json({
                    error:
                        "Son tarih metin veya null olmalıdır.",
                });
                return;
            }

            if (
                body.categoryId !== undefined &&
                body.categoryId !== null &&
                typeof body.categoryId !== "string"
            ) {
                response.status(400).json({
                    error:
                        "Kategori kimliği metin veya null olmalıdır.",
                });
                return;
            }

            const input: CreateTaskInput = {
                ownerId: authenticatedUser.userId,
                title: body.title,

                ...(body.description !== undefined
                    ? {
                        description:
                            body.description as
                                | string
                                | null,
                    }
                    : {}),

                ...(body.priority !== undefined
                    ? { priority: body.priority }
                    : {}),

                ...(body.dueDate !== undefined
                    ? {
                        dueDate: body.dueDate as
                            | string
                            | null,
                    }
                    : {}),

                ...(body.categoryId !== undefined
                    ? {
                        categoryId:
                            body.categoryId as
                                | string
                                | null,
                    }
                    : {}),
            };

            const task =
                await this.createTaskUseCase.execute(input);

            response.status(201).json({
                message:
                    "Görev başarıyla oluşturuldu.",
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
            const authenticatedUser =
                request.authenticatedUser;

            if (!authenticatedUser) {
                throw new InvalidAccessTokenError();
            }

            const tasks =
                await this.listTasksUseCase.execute(
                    authenticatedUser.userId,
                );

            response.status(200).json({
                tasks: tasks.map(serializeTask),
            });
        } catch (error: unknown) {
            next(error);
        }
    };

    update = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const authenticatedUser =
                request.authenticatedUser;

            if (!authenticatedUser) {
                throw new InvalidAccessTokenError();
            }

            const taskId = request.params.id;

            if (
                typeof taskId !== "string" ||
                !taskId.trim()
            ) {
                response.status(400).json({
                    error: "Görev kimliği zorunludur.",
                });
                return;
            }
            const body =
                request.body as UpdateTaskRequestBody;

            if (
                body.title !== undefined &&
                typeof body.title !== "string"
            ) {
                response.status(400).json({
                    error:
                        "Görev başlığı metin olmalıdır.",
                });
                return;
            }

            if (
                body.description !== undefined &&
                body.description !== null &&
                typeof body.description !== "string"
            ) {
                response.status(400).json({
                    error:
                        "Açıklama metin veya null olmalıdır.",
                });
                return;
            }

            if (
                body.priority !== undefined &&
                !isTaskPriority(body.priority)
            ) {
                response.status(400).json({
                    error:
                        "Öncelik low, medium veya high olmalıdır.",
                });
                return;
            }

            if (
                body.dueDate !== undefined &&
                body.dueDate !== null &&
                typeof body.dueDate !== "string"
            ) {
                response.status(400).json({
                    error:
                        "Son tarih metin veya null olmalıdır.",
                });
                return;
            }

            if (
                body.categoryId !== undefined &&
                body.categoryId !== null &&
                typeof body.categoryId !== "string"
            ) {
                response.status(400).json({
                    error:
                        "Kategori kimliği metin veya null olmalıdır.",
                });
                return;
            }

            const input: UpdateTaskInput = {
                taskId,
                ownerId: authenticatedUser.userId,

                ...(typeof body.title === "string"
                    ? { title: body.title }
                    : {}),

                ...(body.description === null ||
                typeof body.description === "string"
                    ? {
                        description: body.description,
                    }
                    : {}),

                ...(isTaskPriority(body.priority)
                    ? { priority: body.priority }
                    : {}),

                ...(body.dueDate === null ||
                typeof body.dueDate === "string"
                    ? { dueDate: body.dueDate }
                    : {}),

                ...(body.categoryId === null ||
                typeof body.categoryId === "string"
                    ? { categoryId: body.categoryId }
                    : {}),
            };

            const task =
                await this.updateTaskUseCase.execute(input);

            response.status(200).json({
                message:
                    "Görev başarıyla güncellendi.",
                task: serializeTask(task),
            });
        } catch (error: unknown) {
            next(error);
        }
    };

    changeStatus = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const authenticatedUser =
                request.authenticatedUser;

            if (!authenticatedUser) {
                throw new InvalidAccessTokenError();
            }

            const taskId = request.params.id;

            if (
                typeof taskId !== "string" ||
                !taskId.trim()
            ) {
                response.status(400).json({
                    error: "Görev kimliği zorunludur.",
                });
                return;
            }

            const body =
                request.body as
                    ChangeTaskStatusRequestBody;

            if (!isTaskStatus(body.status)) {
                response.status(400).json({
                    error:
                        "Durum pending, in_progress veya completed olmalıdır.",
                });
                return;
            }

            const task =
                await this.changeTaskStatusUseCase.execute({
                    taskId,
                    ownerId:
                    authenticatedUser.userId,
                    status: body.status,
                });

            response.status(200).json({
                message:
                    "Görev durumu başarıyla güncellendi.",
                task: serializeTask(task),
            });
        } catch (error: unknown) {
            next(error);
        }
    };

    remove = async (
        request: Request,
        response: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const authenticatedUser =
                request.authenticatedUser;

            if (!authenticatedUser) {
                throw new InvalidAccessTokenError();
            }

            const taskId = request.params.id;

            if (
                typeof taskId !== "string" ||
                !taskId.trim()
            ) {
                response.status(400).json({
                    error: "Görev kimliği zorunludur.",
                });
                return;
            }

            await this.deleteTaskUseCase.execute({
                taskId,
                ownerId: authenticatedUser.userId,
            });

            response.status(204).send();
        } catch (error: unknown) {
            next(error);
        }
    };
}