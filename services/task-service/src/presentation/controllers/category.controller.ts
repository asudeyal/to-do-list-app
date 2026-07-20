import type {
    NextFunction,
    Request,
    Response,
} from "express";

import { InvalidAccessTokenError } from "../../application/errors/invalid-access-token.error.js";
import type { CreateCategoryUseCase } from "../../application/use-cases/create-category.use-case.js";

interface CreateCategoryRequestBody {
    name?: unknown;
    color?: unknown;
}

export class CategoryController {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
    ) {}

    create = async (
        request: Request<
            Record<string, never>,
            unknown,
            CreateCategoryRequestBody
        >,
        response: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const authenticatedUser = request.authenticatedUser;

            if (!authenticatedUser) {
                throw new InvalidAccessTokenError();
            }

            const { name, color } = request.body;

            if (typeof name !== "string") {
                response.status(400).json({
                    error: "Kategori adı metin olarak gönderilmelidir.",
                });
                return;
            }

            if (
                color !== undefined &&
                typeof color !== "string"
            ) {
                response.status(400).json({
                    error: "Kategori rengi metin olarak gönderilmelidir.",
                });
                return;
            }

            const category =
                await this.createCategoryUseCase.execute({
                    ownerId: authenticatedUser.userId,
                    name,
                    ...(color !== undefined ? { color } : {}),
                });

            response.status(201).json({
                message: "Kategori başarıyla oluşturuldu.",
                category: {
                    id: category.id,
                    name: category.name,
                    color: category.color,
                    createdAt: category.createdAt.toISOString(),
                },
            });
        } catch (error: unknown) {
            next(error);
        }
    };
}