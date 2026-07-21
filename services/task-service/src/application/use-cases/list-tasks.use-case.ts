import {
    mapTaskToOutput,
    type TaskOutput,
} from "../dtos/task-output.js";
import type { TaskRepository } from "../../domain/repositories/task.repository.js";

export class ListTasksUseCase {
    constructor(
        private readonly taskRepository: TaskRepository,
    ) {}

    async execute(ownerId: string): Promise<TaskOutput[]> {
        const tasks =
            await this.taskRepository.findAllByOwnerId(ownerId);

        return tasks.map(mapTaskToOutput);
    }
}