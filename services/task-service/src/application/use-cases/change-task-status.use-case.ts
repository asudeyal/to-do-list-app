import {
    mapTaskToOutput,
    type TaskOutput,
} from "../dtos/task-output.js";
import { TaskNotFoundError } from "../errors/task-not-found.error.js";
import type { TaskStatus } from "../../domain/entities/task.js";
import type { TaskRepository } from "../../domain/repositories/task.repository.js";

export interface ChangeTaskStatusInput {
    taskId: string;
    ownerId: string;
    status: TaskStatus;
}

export class ChangeTaskStatusUseCase {
    constructor(
        private readonly taskRepository: TaskRepository,
    ) {}

    async execute(
        input: ChangeTaskStatusInput,
    ): Promise<TaskOutput> {
        const task =
            await this.taskRepository.findByIdAndOwnerId(
                input.taskId,
                input.ownerId,
            );

        if (!task) {
            throw new TaskNotFoundError();
        }

        task.changeStatus(input.status);

        await this.taskRepository.update(task);

        return mapTaskToOutput(task);
    }
}