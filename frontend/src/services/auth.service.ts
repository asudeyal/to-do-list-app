import type {
    LoginInput,
    LoginResponse,
    RegisterInput,
    RegisterResponse,
} from "../types/auth";

interface ApiErrorResponse {
    error?: unknown;
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

    return "İşlem sırasında beklenmeyen bir hata oluştu.";
}

async function postJson<TResponse>(
    url: string,
    body: unknown,
): Promise<TResponse> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const responseBody: unknown =
        await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            extractErrorMessage(responseBody),
        );
    }

    return responseBody as TResponse;
}

export function login(
    input: LoginInput,
): Promise<LoginResponse> {
    return postJson<LoginResponse>(
        "/identity-api/auth/login",
        input,
    );
}

export function register(
    input: RegisterInput,
): Promise<RegisterResponse> {
    return postJson<RegisterResponse>(
        "/identity-api/auth/register",
        input,
    );
}