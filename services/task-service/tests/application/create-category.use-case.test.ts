import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CategoryAlreadyExistsError } from "../../src/application/errors/category-already-exists.error.js";
import { CreateCategoryUseCase } from "../../src/application/use-cases/create-category.use-case.js";
import type { Category } from "../../src/domain/entities/category.js";
import { DomainError } from "../../src/domain/errors/domain.error.js";
import type { CategoryRepository } from "../../src/domain/repositories/category.repository.js";

const FIRST_OWNER_ID =
    "11111111-1111-4111-8111-111111111111";

const SECOND_OWNER_ID =
    "22222222-2222-4222-8222-222222222222";

class InMemoryCategoryRepository
    implements CategoryRepository
{
    readonly categories: Category[] = [];

    async findByIdAndOwnerId(
        id: string,
        ownerId: string,
    ): Promise<Category | null> {
        return (
            this.categories.find(
                (category) =>
                    category.id === id &&
                    category.ownerId === ownerId,
            ) ?? null
        );
    }

    async findByNameAndOwnerId(
        name: string,
        ownerId: string,
    ): Promise<Category | null> {
        const normalizedName = name.trim().toLowerCase();

        return (
            this.categories.find(
                (category) =>
                    category.ownerId === ownerId &&
                    category.name.toLowerCase() === normalizedName,
            ) ?? null
        );
    }

    async save(category: Category): Promise<void> {
        this.categories.push(category);
    }
}

function createTestContext(): {
    useCase: CreateCategoryUseCase;
    repository: InMemoryCategoryRepository;
} {
    const repository = new InMemoryCategoryRepository();

    return {
        useCase: new CreateCategoryUseCase(repository),
        repository,
    };
}

describe("CreateCategoryUseCase", () => {
    it("geçerli bilgilerle kategori oluşturur", async () => {
        const { useCase, repository } = createTestContext();

        const result = await useCase.execute({
            ownerId: FIRST_OWNER_ID,
            name: "  İş  ",
            color: "#3b82f6",
        });

        assert.equal(result.name, "İş");
        assert.equal(result.color, "#3B82F6");
        assert.equal(repository.categories.length, 1);
        assert.equal(
            repository.categories[0]?.ownerId,
            FIRST_OWNER_ID,
        );
    });

    it("aynı kullanıcı için aynı kategori adını kabul etmez", async () => {
        const { useCase } = createTestContext();

        await useCase.execute({
            ownerId: FIRST_OWNER_ID,
            name: "Kişisel",
        });

        await assert.rejects(
            () =>
                useCase.execute({
                    ownerId: FIRST_OWNER_ID,
                    name: "  kişisel  ",
                }),
            CategoryAlreadyExistsError,
        );
    });

    it("farklı kullanıcıların aynı kategori adını kullanmasına izin verir", async () => {
        const { useCase, repository } = createTestContext();

        await useCase.execute({
            ownerId: FIRST_OWNER_ID,
            name: "İş",
        });

        await useCase.execute({
            ownerId: SECOND_OWNER_ID,
            name: "iş",
        });

        assert.equal(repository.categories.length, 2);
    });

    it("geçersiz renk biçimini kabul etmez", async () => {
        const { useCase, repository } = createTestContext();

        await assert.rejects(
            () =>
                useCase.execute({
                    ownerId: FIRST_OWNER_ID,
                    name: "Geçersiz Renk",
                    color: "mavi",
                }),
            DomainError,
        );

        assert.equal(repository.categories.length, 0);
    });
});