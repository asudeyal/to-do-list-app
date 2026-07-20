import { CategoryAlreadyExistsError } from "../errors/category-already-exists.error.js";
import { Category } from "../../domain/entities/category.js";
import type { CategoryRepository } from "../../domain/repositories/category.repository.js";

export interface CreateCategoryInput {
    ownerId: string;
    name: string;
    color?: string;
}

export interface CreateCategoryOutput {
    id: string;
    name: string;
    color: string;
    createdAt: Date;
}

export class CreateCategoryUseCase {
    constructor(
        private readonly categoryRepository: CategoryRepository,
    ) {}

    async execute(
        input: CreateCategoryInput,
    ): Promise<CreateCategoryOutput> {
        const existingCategory =
            await this.categoryRepository.findByNameAndOwnerId(
                input.name,
                input.ownerId,
            );

        if (existingCategory) {
            throw new CategoryAlreadyExistsError();
        }

        const category = Category.create({
            ownerId: input.ownerId,
            name: input.name,
            ...(input.color !== undefined
                ? { color: input.color }
                : {}),
        });

        await this.categoryRepository.save(category);

        return {
            id: category.id,
            name: category.name,
            color: category.color,
            createdAt: category.createdAt,
        };
    }
}