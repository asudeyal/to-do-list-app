import type { Task } from "../../domain/entities/task.js";
import type {
    TaskPriority,
    TaskStatus,
} from "../../domain/entities/task.js";

export interface TaskOutput {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    categoryId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export function mapTaskToOutput(task: Task): TaskOutput {
    return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        categoryId: task.categoryId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
    };
}