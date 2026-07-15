import pg from "pg";

import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
    host: env.database.host,
    port: env.database.port,
    database: env.database.name,
    user: env.database.user,
    password: env.database.password,
    max: 10,
    connectionTimeoutMillis: 5000,
});

interface DatabaseConnectionInfo {
    database_name: string;
    database_user: string;
}

export async function verifyDatabaseConnection(): Promise<void> {
    const result = await pool.query<DatabaseConnectionInfo>(
        `SELECT
       current_database() AS database_name,
       current_user AS database_user`,
    );

    const connectionInfo = result.rows[0];

    if (!connectionInfo) {
        throw new Error("PostgreSQL bağlantı bilgisi alınamadı.");
    }

    console.log(
        `PostgreSQL bağlantısı başarılı: ${connectionInfo.database_name} / ${connectionInfo.database_user}`,
    );
}