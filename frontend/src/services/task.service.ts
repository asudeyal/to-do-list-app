import { getAccessToken } from "./auth-storage";
import type {
    CreateTaskInput,
    Task,
} from "../types/task";

interface TaskListResponse {
    tasks: Task[];
}

interface ApiErrorResponse {
    error?: unknown;
}

export class TaskApiError extends Error {
    readonly statusCode: number;

    constructor(
        message: string,
        statusCode: number,
    ) {
        super(message);

        this.name = "TaskApiError";
        this.statusCode = statusCode;
    }
}

function extractErrorMessage(
    responseBody: unknown,
): string {
    if (
        typeof responseBody === "object" &&
        responseBody !== null &&
        "error" in responseBody
    ) {
        const { error } =
            responseBody as ApiErrorResponse;

        if (typeof error === "string") {
            return error;
        }
    }

    return "Görevler alınırken bir hata oluştu.";
}

export async function getTasks(
    signal?: AbortSignal,
): Promise<Task[]> {
    const accessToken = getAccessToken();

    if (!accessToken) {
        throw new TaskApiError(
            "Oturum bilgisi bulunamadı.",
            401,
        );
    }

    let response: Response;

    try {
        response = await fetch("/task-api/tasks", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            ...(signal ? { signal } : {}),
        });
    } catch (error: unknown) {
        if (
            error instanceof DOMException &&
            error.name === "AbortError"
        ) {
            throw error;
        }

        throw new TaskApiError(
            "Task Service'e ulaşılamadı.",
            0,
        );
    }

    const responseBody: unknown =
        await response.json().catch(() => null);

    if (!response.ok) {
        throw new TaskApiError(
            extractErrorMessage(responseBody),
            response.status,
        );
    }

    if (
        typeof responseBody !== "object" ||
        responseBody === null ||
        !("tasks" in responseBody) ||
        !Array.isArray(responseBody.tasks)
    ) {
        throw new TaskApiError(
            "Task Service geçersiz bir cevap döndürdü.",
            0,
        );
    }

    return (responseBody as TaskListResponse).tasks;
}
interface CreateTaskResponse {
    message: string;
    task: Task;
}

export async function createTask(
    input: CreateTaskInput,
): Promise<Task> {
    const accessToken = getAccessToken();

    if (!accessToken) {
        throw new TaskApiError(
            "Oturum bilgisi bulunamadı.",
            401,
        );
    }

    let response: Response;

    try {
        response = await fetch("/task-api/tasks", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        });
    } catch {
        throw new TaskApiError(
            "Task Service'e ulaşılamadı.",
            0,
        );
    }

    const responseBody: unknown =
        await response.json().catch(() => null);

    if (!response.ok) {
        throw new TaskApiError(
            extractErrorMessage(responseBody),
            response.status,
        );
    }

    if (
        typeof responseBody !== "object" ||
        responseBody === null ||
        !("task" in responseBody)
    ) {
        throw new TaskApiError(
            "Task Service geçersiz bir cevap döndürdü.",
            0,
        );
    }

    return (responseBody as CreateTaskResponse).task;
}