import {
    mapTaskToOutput,
    type TaskOutput,
} from "../dtos/task-output.js";
import { CategoryNotFoundError } from "../errors/category-not-found.error.js";
import { TaskNotFoundError } from "../errors/task-not-found.error.js";
import type { TaskPriority } from "../../domain/entities/task.js";
import { DomainError } from "../../domain/errors/domain.error.js";
import type { CategoryRepository } from "../../domain/repositories/category.repository.js";
import type { TaskRepository } from "../../domain/repositories/task.repository.js";

export interface UpdateTaskInput {
    taskId: string;
    ownerId: string;
    title?: string;
    description?: string | null;
    priority?: TaskPriority;
    dueDate?: string | null;
    categoryId?: string | null;
}

export class UpdateTaskUseCase {
    constructor(
        private readonly taskRepository: TaskRepository,
        private readonly categoryRepository: CategoryRepository,
    ) {}

    async execute(
        input: UpdateTaskInput,
    ): Promise<TaskOutput> {
        const task =
            await this.taskRepository.findByIdAndOwnerId(
                input.taskId,
                input.ownerId,
            );

        if (!task) {
            throw new TaskNotFoundError();
        }

        const hasChanges =
            input.title !== undefined ||
            input.description !== undefined ||
            input.priority !== undefined ||
            input.dueDate !== undefined ||
            input.categoryId !== undefined;

        if (!hasChanges) {
            throw new DomainError(
                "Güncellenecek en az bir görev alanı gönderilmelidir.",
            );
        }

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

        if (input.title !== undefined) {
            task.rename(input.title);
        }

        if (input.description !== undefined) {
            task.changeDescription(input.description);
        }

        if (input.priority !== undefined) {
            task.changePriority(input.priority);
        }

        if (input.dueDate !== undefined) {
            task.changeDueDate(input.dueDate);
        }

        if (input.categoryId !== undefined) {
            if (input.categoryId === null) {
                task.removeCategory();
            } else {
                task.assignCategory(input.categoryId);
            }
        }

        await this.taskRepository.update(task);

        return mapTaskToOutput(task);
    }
}