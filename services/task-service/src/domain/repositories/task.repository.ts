import type { Task } from "../entities/task.js";

export interface TaskRepository {
    findByIdAndOwnerId(
        id: string,
        ownerId: string,
    ): Promise<Task | null>;

    findAllByOwnerId(ownerId: string): Promise<Task[]>;

    save(task: Task): Promise<void>;
}