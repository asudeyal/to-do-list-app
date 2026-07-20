import { LoginUserUseCase } from "./application/use-cases/login-user.use-case.js";
import { RegisterUserUseCase } from "./application/use-cases/register-user.use-case.js";
import { pool } from "./infrastructure/database/database.js";
import { env } from "./infrastructure/config/env.js";
import { PostgresUserRepository } from "./infrastructure/repositories/postgres-user.repository.js";
import { JwtTokenGenerator } from "./infrastructure/security/jwt-token-generator.js";
import { ScryptPasswordHasher } from "./infrastructure/security/scrypt-password-hasher.js";
import { AuthController } from "./presentation/controllers/auth.controller.js";

const userRepository = new PostgresUserRepository(pool);
const passwordHasher = new ScryptPasswordHasher();

const tokenGenerator = new JwtTokenGenerator({
    secret: env.jwt.secret,
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
    expiresIn: env.jwt.expiresIn,
});

const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    passwordHasher,
);

const loginUserUseCase = new LoginUserUseCase(
    userRepository,
    passwordHasher,
    tokenGenerator,
);

export const authController = new AuthController(
    registerUserUseCase,
    loginUserUseCase,
);