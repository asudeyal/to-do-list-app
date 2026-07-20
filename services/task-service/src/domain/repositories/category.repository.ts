import type { Category } from "../entities/category.js";

export interface CategoryRepository {
    findByIdAndOwnerId(
        id: string,
        ownerId: string,
    ): Promise<Category | null>;

    findByNameAndOwnerId(
        name: string,
        ownerId: string,
    ): Promise<Category | null>;

    save(category: Category): Promise<void>;
}