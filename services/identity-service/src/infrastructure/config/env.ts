import "dotenv/config";

function getRequiredEnvironmentVariable(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} ortam değişkeni tanımlı değil.`);
    }

    return value;
}

function getNumberEnvironmentVariable(
    name: string,
    defaultValue: number,
): number {
    const value = process.env[name];

    if (!value) {
        return defaultValue;
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
        throw new Error(`${name} sayısal bir değer olmalıdır.`);
    }

    return numberValue;
}

export const env = {
    port: getNumberEnvironmentVariable("PORT", 3000),

    database: {
        host: getRequiredEnvironmentVariable("DB_HOST"),
        port: getNumberEnvironmentVariable("DB_PORT", 5432),
        name: getRequiredEnvironmentVariable("DB_NAME"),
        user: getRequiredEnvironmentVariable("DB_USER"),
        password: getRequiredEnvironmentVariable("DB_PASSWORD"),
    },
} as const;