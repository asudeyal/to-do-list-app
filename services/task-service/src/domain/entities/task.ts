import { randomUUID } from "node:crypto";

import { DomainError } from "../errors/domain.error.js";

export type TaskStatus =
    | "pending"
    | "in_progress"
    | "completed";

export type TaskPriority =
    | "low"
    | "medium"
    | "high";

const VALID_STATUSES: readonly TaskStatus[] = [
    "pending",
    "in_progress",
    "completed",
];

const VALID_PRIORITIES: readonly TaskPriority[] = [
    "low",
    "medium",
    "high",
];

export interface CreateTaskProperties {
    ownerId: string;
    title: string;
    description?: string | null;
    priority?: TaskPriority;
    dueDate?: string | null;
    categoryId?: string | null;
}

export interface RestoreTaskProperties {
    id: string;
    ownerId: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: string | null;
    categoryId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class Task {
    private constructor(
        public readonly id: string,
        public readonly ownerId: string,
        private currentTitle: string,
        private currentDescription: string | null,
        private currentStatus: TaskStatus,
        private currentPriority: TaskPriority,
        private currentDueDate: string | null,
        private currentCategoryId: string | null,
        public readonly createdAt: Date,
        private currentUpdatedAt: Date,
    ) {}

    static create(properties: CreateTaskProperties): Task {
        const now = new Date();

        return new Task(
            randomUUID(),
            Task.validateUuid(
                properties.ownerId,
                "Kullanıcı kimliği",
            ),
            Task.validateTitle(properties.title),
            Task.validateDescription(properties.description ?? null),
            "pending",
            Task.validatePriority(properties.priority ?? "medium"),
            Task.validateDueDate(properties.dueDate ?? null),
            Task.validateOptionalUuid(
                properties.categoryId ?? null,
                "Kategori kimliği",
            ),
            now,
            now,
        );
    }

    static restore(properties: RestoreTaskProperties): Task {
        return new Task(
            Task.validateUuid(properties.id, "Görev kimliği"),
            Task.validateUuid(
                properties.ownerId,
                "Kullanıcı kimliği",
            ),
            Task.validateTitle(properties.title),
            Task.validateDescription(properties.description),
            Task.validateStatus(properties.status),
            Task.validatePriority(properties.priority),
            Task.validateDueDate(properties.dueDate),
            Task.validateOptionalUuid(
                properties.categoryId,
                "Kategori kimliği",
            ),
            properties.createdAt,
            properties.updatedAt,
        );
    }

    get title(): string {
        return this.currentTitle;
    }

    get description(): string | null {
        return this.currentDescription;
    }

    get status(): TaskStatus {
        return this.currentStatus;
    }

    get priority(): TaskPriority {
        return this.currentPriority;
    }

    get dueDate(): string | null {
        return this.currentDueDate;
    }

    get categoryId(): string | null {
        return this.currentCategoryId;
    }

    get updatedAt(): Date {
        return this.currentUpdatedAt;
    }

    rename(newTitle: string): void {
        this.currentTitle = Task.validateTitle(newTitle);
        this.touch();
    }

    changeDescription(newDescription: string | null): void {
        this.currentDescription =
            Task.validateDescription(newDescription);

        this.touch();
    }

    changeStatus(newStatus: TaskStatus): void {
        this.currentStatus = Task.validateStatus(newStatus);
        this.touch();
    }

    changePriority(newPriority: TaskPriority): void {
        this.currentPriority =
            Task.validatePriority(newPriority);

        this.touch();
    }

    changeDueDate(newDueDate: string | null): void {
        this.currentDueDate = Task.validateDueDate(newDueDate);
        this.touch();
    }

    assignCategory(categoryId: string): void {
        this.currentCategoryId = Task.validateUuid(
            categoryId,
            "Kategori kimliği",
        );

        this.touch();
    }

    removeCategory(): void {
        this.currentCategoryId = null;
        this.touch();
    }

    private touch(): void {
        this.currentUpdatedAt = new Date();
    }

    private static validateTitle(title: string): string {
        const normalizedTitle = title.trim();

        if (!normalizedTitle) {
            throw new DomainError("Görev başlığı boş olamaz.");
        }

        if (normalizedTitle.length > 200) {
            throw new DomainError(
                "Görev başlığı en fazla 200 karakter olabilir.",
            );
        }

        return normalizedTitle;
    }

    private static validateDescription(
        description: string | null,
    ): string | null {
        if (description === null) {
            return null;
        }

        const normalizedDescription = description.trim();

        if (!normalizedDescription) {
            return null;
        }

        if (normalizedDescription.length > 2000) {
            throw new DomainError(
                "Görev açıklaması en fazla 2000 karakter olabilir.",
            );
        }

        return normalizedDescription;
    }

    private static validateStatus(status: string): TaskStatus {
        if (!VALID_STATUSES.includes(status as TaskStatus)) {
            throw new DomainError("Geçersiz görev durumu.");
        }

        return status as TaskStatus;
    }

    private static validatePriority(
        priority: string,
    ): TaskPriority {
        if (!VALID_PRIORITIES.includes(priority as TaskPriority)) {
            throw new DomainError("Geçersiz görev önceliği.");
        }

        return priority as TaskPriority;
    }

    private static validateDueDate(
        dueDate: string | null,
    ): string | null {
        if (dueDate === null) {
            return null;
        }

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;

        if (!datePattern.test(dueDate)) {
            throw new DomainError(
                "Son tarih YYYY-MM-DD biçiminde olmalıdır.",
            );
        }

        const parsedTime = Date.parse(`${dueDate}T00:00:00.000Z`);

        if (
            Number.isNaN(parsedTime) ||
            new Date(parsedTime).toISOString().slice(0, 10) !== dueDate
        ) {
            throw new DomainError("Geçerli bir son tarih girilmelidir.");
        }

        return dueDate;
    }

    private static validateOptionalUuid(
        value: string | null,
        fieldName: string,
    ): string | null {
        if (value === null) {
            return null;
        }

        return Task.validateUuid(value, fieldName);
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