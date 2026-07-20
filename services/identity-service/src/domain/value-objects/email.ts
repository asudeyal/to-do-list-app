import { DomainError } from "../errors/domain.error.js";

export class Email {
    private constructor(private readonly normalizedValue: string) {}

    static create(value: string): Email {
        const normalizedValue = value.trim().toLowerCase();

        if (!normalizedValue) {
            throw new DomainError("E-posta adresi boş olamaz.");
        }

        if (normalizedValue.length > 255) {
            throw new DomainError("E-posta adresi en fazla 255 karakter olabilir.");
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedValue)) {
            throw new DomainError("Geçerli bir e-posta adresi girilmelidir.");
        }

        return new Email(normalizedValue);
    }

    get value(): string {
        return this.normalizedValue;
    }

    equals(otherEmail: Email): boolean {
        return this.normalizedValue === otherEmail.normalizedValue;
    }
}