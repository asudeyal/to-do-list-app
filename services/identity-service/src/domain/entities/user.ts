import { randomUUID } from "node:crypto";

import { DomainError } from "../errors/domain.error.js";
import { Email } from "../value-objects/email.js";

export interface CreateUserProperties {
    name: string;
    email: Email;
    passwordHash: string;
}

export interface RestoreUserProperties {
    id: string;
    name: string;
    email: Email;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export class User {
    private constructor(
        public readonly id: string,
        private currentName: string,
        public readonly email: Email,
        private currentPasswordHash: string,
        public readonly createdAt: Date,
        private currentUpdatedAt: Date,
    ) {}

    static create(properties: CreateUserProperties): User {
        const now = new Date();

        return new User(
            randomUUID(),
            User.validateName(properties.name),
            properties.email,
            User.validatePasswordHash(properties.passwordHash),
            now,
            now,
        );
    }

    static restore(properties: RestoreUserProperties): User {
        if (!properties.id.trim()) {
            throw new DomainError("Kullanıcı kimliği boş olamaz.");
        }

        return new User(
            properties.id,
            User.validateName(properties.name),
            properties.email,
            User.validatePasswordHash(properties.passwordHash),
            properties.createdAt,
            properties.updatedAt,
        );
    }

    get name(): string {
        return this.currentName;
    }

    get passwordHash(): string {
        return this.currentPasswordHash;
    }

    get updatedAt(): Date {
        return this.currentUpdatedAt;
    }

    changeName(newName: string): void {
        this.currentName = User.validateName(newName);
        this.currentUpdatedAt = new Date();
    }

    changePasswordHash(newPasswordHash: string): void {
        this.currentPasswordHash =
            User.validatePasswordHash(newPasswordHash);

        this.currentUpdatedAt = new Date();
    }

    private static validateName(name: string): string {
        const normalizedName = name.trim();

        if (!normalizedName) {
            throw new DomainError("Kullanıcı adı boş olamaz.");
        }

        if (normalizedName.length > 100) {
            throw new DomainError("Kullanıcı adı en fazla 100 karakter olabilir.");
        }

        return normalizedName;
    }

    private static validatePasswordHash(passwordHash: string): string {
        if (!passwordHash.trim()) {
            throw new DomainError("Parola özeti boş olamaz.");
        }

        return passwordHash;
    }
}