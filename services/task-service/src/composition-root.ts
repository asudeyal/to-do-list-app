import { ChangeTaskStatusUseCase } from "./application/use-cases/change-task-status.use-case.js";
import { CreateCategoryUseCase } from "./application/use-cases/create-category.use-case.js";
import { CreateTaskUseCase } from "./application/use-cases/create-task.use-case.js";
import { DeleteTaskUseCase } from "./application/use-cases/delete-task.use-case.js";
import { ListTasksUseCase } from "./application/use-cases/list-tasks.use-case.js";
import { UpdateTaskUseCase } from "./application/use-cases/update-task.use-case.js";
import { env } from "./infrastructure/config/env.js";
import { pool } from "./infrastructure/database/database.js";
import { PostgresCategoryRepository } from "./infrastructure/repositories/postgres-category.repository.js";
import { PostgresTaskRepository } from "./infrastructure/repositories/postgres-task.repository.js";
import { JwtTokenVerifier } from "./infrastructure/security/jwt-token-verifier.js";
import { CategoryController } from "./presentation/controllers/category.controller.js";
import { TaskController } from "./presentation/controllers/task.controller.js";
import { createAuthenticationMiddleware } from "./presentation/middleware/authentication.middleware.js";

const tokenVerifier = new JwtTokenVerifier({
    secret: env.jwt.secret,
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
});

const categoryRepository =
    new PostgresCategoryRepository(pool);

const taskRepository =
    new PostgresTaskRepository(pool);

const createCategoryUseCase =
    new CreateCategoryUseCase(categoryRepository);

const createTaskUseCase =
    new CreateTaskUseCase(
        taskRepository,
        categoryRepository,
    );

const listTasksUseCase =
    new ListTasksUseCase(taskRepository);

const updateTaskUseCase =
    new UpdateTaskUseCase(
        taskRepository,
        categoryRepository,
    );

const changeTaskStatusUseCase =
    new ChangeTaskStatusUseCase(taskRepository);

const deleteTaskUseCase =
    new DeleteTaskUseCase(taskRepository);

export const authenticationMiddleware =
    createAuthenticationMiddleware(tokenVerifier);

export const categoryController =
    new CategoryController(createCategoryUseCase);

export const taskController =
    new TaskController(
        createTaskUseCase,
        listTasksUseCase,
        updateTaskUseCase,
        changeTaskStatusUseCase,
        deleteTaskUseCase,
    );