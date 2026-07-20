import express from "express";

import { authController } from "./composition-root.js";
import { errorHandler } from "./presentation/middleware/error-handler.middleware.js";
import { createAuthRouter } from "./presentation/routes/auth.routes.js";
import healthRouter from "./presentation/routes/health.routes.js";

const app = express();

app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/auth", createAuthRouter(authController));

app.use(errorHandler);

export default app;