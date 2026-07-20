import type {
    NextFunction,
    Request,
    Response,
} from "express";

import type { RegisterUserUseCase } from "../../application/use-cases/register-user.use-case.js";

interface RegisterRequestBody {
    name?: unknown;
    email?: unknown;
    password?: unknown;
}

export class AuthController {
    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
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
}