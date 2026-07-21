import type { TaskOutput } from "../dtos/task-output.js";
import { mapTaskToOutput } from "../dtos/task-output.js";
import { CategoryNotFoundError } from "../errors/category-not-found.error.js";
import {
    Task,
    type CreateTaskProperties,
    type TaskPriority,
} from "../../domain/entities/task.js";
import type { CategoryRepository } from "../../domain/repositories/category.repository.js";
import type { TaskRepository } from "../../domain/repositories/task.repository.js";

export interface CreateTaskInput {
    ownerId: string;
    title: string;
    description?: string | null;
    priority?: TaskPriority;
    dueDate?: string | null;
    categoryId?: string | null;
}

export class CreateTaskUseCase {
    constructor(
        private readonly taskRepository: TaskRepository,
        private readonly categoryRepository: CategoryRepository,
    ) {}

    async execute(input: CreateTaskInput): Promise<TaskOutput> {
        if (
            input.categoryId !== undefined &&
            input.categoryId !== null
        ) {
            const category =
                await this.categoryRepository.findByIdAndOwnerId(
                    input.categoryId,
                    input.ownerId,
                );

            if (!category) {
                throw new CategoryNotFoundError();
            }
        }

        const taskProperties: CreateTaskProperties = {
            ownerId: input.ownerId,
            title: input.title,
            ...(input.description !== undefined
                ? { description: input.description }
                : {}),
            ...(input.priority !== undefined
                ? { priority: input.priority }
                : {}),
            ...(input.dueDate !== undefined
                ? { dueDate: input.dueDate }
                : {}),
            ...(input.categoryId !== undefined
                ? { categoryId: input.categoryId }
                : {}),
        };

        const task = Task.create(taskProperties);

        await this.taskRepository.save(task);

        return mapTaskToOutput(task);
    }
}