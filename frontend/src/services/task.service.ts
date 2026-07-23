import { getAccessToken } from "./auth-storage";
import type {
    CreateTaskInput,
    Task,
    TaskStatus,
    UpdateTaskInput,
} from "../types/task";

interface TaskListResponse {
    tasks: Task[];
}

interface TaskResponse {
    message: string;
    task: Task;
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

    return "Görev işlemi sırasında bir hata oluştu.";
}

async function request<TResponse>(
    path: string,
    options: RequestInit,
    signal?: AbortSignal,
): Promise<TResponse> {
    const accessToken = getAccessToken();

    if (!accessToken) {
        throw new TaskApiError(
            "Oturum bilgisi bulunamadı.",
            401,
        );
    }

    const headers = new Headers(options.headers);

    headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
    );

    let response: Response;

    try {
        response = await fetch(
            `/task-api${path}`,
            {
                ...options,
                headers,
                ...(signal ? { signal } : {}),
            },
        );
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
        response.status === 204
            ? null
            : await response
                .json()
                .catch(() => null);

    if (!response.ok) {
        throw new TaskApiError(
            extractErrorMessage(responseBody),
            response.status,
        );
    }

    return responseBody as TResponse;
}

function extractTask(
    responseBody: TaskResponse,
): Task {
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

    return responseBody.task;
}

export async function getTasks(
    signal?: AbortSignal,
): Promise<Task[]> {
    const responseBody =
        await request<TaskListResponse>(
            "/tasks",
            {
                method: "GET",
            },
            signal,
        );

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

    return responseBody.tasks;
}

export async function createTask(
    input: CreateTaskInput,
): Promise<Task> {
    const responseBody =
        await request<TaskResponse>(
            "/tasks",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(input),
            },
        );

    return extractTask(responseBody);
}

export async function updateTask(
    taskId: string,
    input: UpdateTaskInput,
): Promise<Task> {
    const responseBody =
        await request<TaskResponse>(
            `/tasks/${encodeURIComponent(taskId)}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(input),
            },
        );

    return extractTask(responseBody);
}

export async function changeTaskStatus(
    taskId: string,
    status: TaskStatus,
): Promise<Task> {
    const responseBody =
        await request<TaskResponse>(
            `/tasks/${encodeURIComponent(
                taskId,
            )}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            },
        );

    return extractTask(responseBody);
}

export async function deleteTask(
    taskId: string,
): Promise<void> {
    await request<null>(
        `/tasks/${encodeURIComponent(taskId)}`,
        {
            method: "DELETE",
        },
    );
}