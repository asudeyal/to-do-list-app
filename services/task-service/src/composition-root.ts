import { CreateCategoryUseCase } from "./application/use-cases/create-category.use-case.js";
import { env } from "./infrastructure/config/env.js";
import { pool } from "./infrastructure/database/database.js";
import { PostgresCategoryRepository } from "./infrastructure/repositories/postgres-category.repository.js";
import { JwtTokenVerifier } from "./infrastructure/security/jwt-token-verifier.js";
import { CategoryController } from "./presentation/controllers/category.controller.js";
import { createAuthenticationMiddleware } from "./presentation/middleware/authentication.middleware.js";
import { PostgresTaskRepository } from "./infrastructure/repositories/postgres-task.repository.js";
import { CreateTaskUseCase } from "./application/use-cases/create-task.use-case.js";
import { ListTasksUseCase } from "./application/use-cases/list-tasks.use-case.js";
import { TaskController } from "./presentation/controllers/task.controller.js";

const tokenVerifier = new JwtTokenVerifier({
    secret: env.jwt.secret,
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
});

const categoryRepository =
    new PostgresCategoryRepository(pool);

const createCategoryUseCase =
    new CreateCategoryUseCase(categoryRepository);

export const authenticationMiddleware =
    createAuthenticationMiddleware(tokenVerifier);

export const categoryController =
    new CategoryController(createCategoryUseCase);

const taskRepository = new PostgresTaskRepository(pool);

const createTaskUseCase = new CreateTaskUseCase(
    taskRepository,
    categoryRepository,
);

const listTasksUseCase = new ListTasksUseCase(
    taskRepository,
);

export const taskController = new TaskController(
    createTaskUseCase,
    listTasksUseCase,
);