import { TaskNotFoundError } from "../errors/task-not-found.error.js";
import type { TaskRepository } from "../../domain/repositories/task.repository.js";

export interface DeleteTaskInput {
    taskId: string;
    ownerId: string;
}

export class DeleteTaskUseCase {
    constructor(
        private readonly taskRepository: TaskRepository,
    ) {}

    async execute(
        input: DeleteTaskInput,
    ): Promise<void> {
        const isDeleted =
            await this.taskRepository.deleteByIdAndOwnerId(
                input.taskId,
                input.ownerId,
            );

        if (!isDeleted) {
            throw new TaskNotFoundError();
        }
    }
}