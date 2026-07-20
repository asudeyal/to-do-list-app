import type {
    NextFunction,
    Request,
    Response,
} from "express";

import type { RegisterUserUseCase } from "../../application/use-cases/register-user.use-case.js";
import type { LoginUserUseCase } from "../../application/use-cases/login-user.use-case.js";

interface RegisterRequestBody {
    name?: unknown;
    email?: unknown;
    password?: unknown;
}
interface LoginRequestBody {
    email?: unknown;
    password?: unknown;
}

export class AuthController {
    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly loginUserUseCase: LoginUserUseCase,
    ) {}

    register = async (
        request: Request<
            Record<string, never>,
            unknown,
            RegisterRequestBody
        >,
        response: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { name, email, password } = request.body;

            if (
                typeof name !== "string" ||
                typeof email !== "string" ||
                typeof password !== "string"
            ) {
                response.status(400).json({
                    error: "Ad, e-posta ve parola metin olarak gönderilmelidir.",
                });
                return;
            }

            const registeredUser = await this.registerUserUseCase.execute({
                name,
                email,
                password,
            });

            response.status(201).json({
                message: "Kullanıcı başarıyla oluşturuldu.",
                user: {
                    id: registeredUser.id,
                    name: registeredUser.name,
                    email: registeredUser.email,
                    createdAt: registeredUser.createdAt.toISOString(),
                },
            });
        } catch (error: unknown) {
            next(error);
        }
    };
    login = async (
        request: Request<
            Record<string, never>,
            unknown,
            LoginRequestBody
        >,
        response: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { email, password } = request.body;

            if (
                typeof email !== "string" ||
                typeof password !== "string"
            ) {
                response.status(400).json({
                    error: "E-posta ve parola metin olarak gönderilmelidir.",
                });
                return;
            }

            const loginResult = await this.loginUserUseCase.execute({
                email,
                password,
            });

            response.status(200).json({
                message: "Giriş başarılı.",
                accessToken: loginResult.accessToken,
                user: loginResult.user,
            });
        } catch (error: unknown) {
            next(error);
        }
    };
}