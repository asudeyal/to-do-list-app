import { randomUUID } from "node:crypto";

import { DomainError } from "../errors/domain.error.js";

const DEFAULT_CATEGORY_COLOR = "#6B7280";

export interface CreateCategoryProperties {
    ownerId: string;
    name: string;
    color?: string;
}

export interface RestoreCategoryProperties {
    id: string;
    ownerId: string;
    name: string;
    color: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Category {
    private constructor(
        public readonly id: string,
        public readonly ownerId: string,
        private currentName: string,
        private currentColor: string,
        public readonly createdAt: Date,
        private currentUpdatedAt: Date,
    ) {}

    static create(
        properties: CreateCategoryProperties,
    ): Category {
        const now = new Date();

        return new Category(
            randomUUID(),
            Category.validateUuid(
                properties.ownerId,
                "Kullanıcı kimliği",
            ),
            Category.validateName(properties.name),
            Category.validateColor(
                properties.color ?? DEFAULT_CATEGORY_COLOR,
            ),
            now,
            now,
        );
    }

    static restore(
        properties: RestoreCategoryProperties,
    ): Category {
        return new Category(
            Category.validateUuid(
                properties.id,
                "Kategori kimliği",
            ),
            Category.validateUuid(
                properties.ownerId,
                "Kullanıcı kimliği",
            ),
            Category.validateName(properties.name),
            Category.validateColor(properties.color),
            properties.createdAt,
            properties.updatedAt,
        );
    }

    get name(): string {
        return this.currentName;
    }

    get color(): string {
        return this.currentColor;
    }

    get updatedAt(): Date {
        return this.currentUpdatedAt;
    }

    rename(newName: string): void {
        this.currentName = Category.validateName(newName);
        this.currentUpdatedAt = new Date();
    }

    changeColor(newColor: string): void {
        this.currentColor = Category.validateColor(newColor);
        this.currentUpdatedAt = new Date();
    }

    private static validateName(name: string): string {
        const normalizedName = name.trim();

        if (!normalizedName) {
            throw new DomainError("Kategori adı boş olamaz.");
        }

        if (normalizedName.length > 80) {
            throw new DomainError(
                "Kategori adı en fazla 80 karakter olabilir.",
            );
        }

        return normalizedName;
    }

    private static validateColor(color: string): string {
        const normalizedColor = color.trim().toUpperCase();

        if (!/^#[0-9A-F]{6}$/.test(normalizedColor)) {
            throw new DomainError(
                "Kategori rengi #RRGGBB biçiminde olmalıdır.",
            );
        }

        return normalizedColor;
    }

    private static validateUuid(
        value: string,
        fieldName: string,
    ): string {
        const uuidPattern =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidPattern.test(value)) {
            throw new DomainError(`${fieldName} geçerli bir UUID olmalıdır.`);
        }

        return value;
    }
}