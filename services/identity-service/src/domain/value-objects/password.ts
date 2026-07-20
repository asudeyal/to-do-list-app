import { DomainError } from "../errors/domain.error.js";

export class Password {
    private constructor(private readonly plainTextValue: string) {}

    static create(value: string): Password {
        if (value.length < 8) {
            throw new DomainError("Parola en az 8 karakter olmalıdır.");
        }

        if (value.length > 128) {
            throw new DomainError("Parola en fazla 128 karakter olabilir.");
        }

        if (!/\S/.test(value)) {
            throw new DomainError("Parola yalnızca boşluklardan oluşamaz.");
        }

        return new Password(value);
    }

    get value(): string {
        return this.plainTextValue;
    }
}