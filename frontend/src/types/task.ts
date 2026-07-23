export type TaskStatus =
    | "pending"
    | "in_progress"
    | "completed";

export type TaskPriority =
    | "low"
    | "medium"
    | "high";

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    categoryId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskInput {
    title: string;
    description?: string | null;
    priority?: TaskPriority;
    dueDate?: string | null;
    categoryId?: string | null;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string | null;
    priority?: TaskPriority;
    dueDate?: string | null;
    categoryId?: string | null;
}