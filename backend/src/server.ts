import app from "./app.js";
import { pool, verifyDatabaseConnection } from "./config/database.js";
import { env } from "./config/env.js";

async function startServer(): Promise<void> {
    try {
        await verifyDatabaseConnection();

        app.listen(env.port, () => {
            console.log(
                `Sunucu http://localhost:${env.port} adresinde çalışıyor.`,
            );
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";

        console.error(`Uygulama başlatılamadı: ${message}`);

        await pool.end();
        process.exit(1);
    }
}

void startServer();