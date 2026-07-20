import type { Pool, QueryResultRow } from "pg";

import { Category } from "../../domain/entities/category.js";
import type { CategoryRepository } from "../../domain/repositories/category.repository.js";

interface CategoryRow extends QueryResultRow {
    id: string;
    owner_id: string;
    name: string;
    color: string;
    created_at: Date;
    updated_at: Date;
}

export class PostgresCategoryRepository
    implements CategoryRepository
{
    constructor(private readonly databasePool: Pool) {}

    async findByIdAndOwnerId(
        id: string,
        ownerId: string,
    ): Promise<Category | null> {
        const result = await this.databasePool.query<CategoryRow>(
            `SELECT
         id,
         owner_id,
         name,
         color,
         created_at,
         updated_at
       FROM categories
       WHERE id = $1
         AND owner_id = $2
       LIMIT 1`,
            [id, ownerId],
        );

        const categoryRow = result.rows[0];

        if (!categoryRow) {
            return null;
        }

        return this.restoreCategory(categoryRow);
    }

    async findByNameAndOwnerId(
        name: string,
        ownerId: string,
    ): Promise<Category | null> {
        const result = await this.databasePool.query<CategoryRow>(
            `SELECT
         id,
         owner_id,
         name,
         color,
         created_at,
         updated_at
       FROM categories
       WHERE owner_id = $1
         AND LOWER(name) = LOWER($2)
       LIMIT 1`,
            [ownerId, name.trim()],
        );

        const categoryRow = result.rows[0];

        if (!categoryRow) {
            return null;
        }

        return this.restoreCategory(categoryRow);
    }

    async save(category: Category): Promise<void> {
        await this.databasePool.query(
            `INSERT INTO categories (
         id,
         owner_id,
         name,
         color,
         created_at,
         updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                category.id,
                category.ownerId,
                category.name,
                category.color,
                category.createdAt,
                category.updatedAt,
            ],
        );
    }

    private restoreCategory(categoryRow: CategoryRow): Category {
        return Category.restore({
            id: categoryRow.id,
            ownerId: categoryRow.owner_id,
            name: categoryRow.name,
            color: categoryRow.color,
            createdAt: categoryRow.created_at,
            updatedAt: categoryRow.updated_at,
        });
    }
}