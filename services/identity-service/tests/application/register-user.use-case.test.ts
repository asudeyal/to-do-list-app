import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EmailAlreadyInUseError } from "../../src/application/errors/email-already-in-use.error.js";
import type { PasswordHasher } from "../../src/application/ports/password-hasher.js";
import { RegisterUserUseCase } from "../../src/application/use-cases/register-user.use-case.js";
import type { User } from "../../src/domain/entities/user.js";
import { DomainError } from "../../src/domain/errors/domain.error.js";
import type { UserRepository } from "../../src/domain/repositories/user.repository.js";
import type { Email } from "../../src/domain/value-objects/email.js";

class InMemoryUserRepository implements UserRepository {
    readonly users: User[] = [];

    async findByEmail(email: Email): Promise<User | null> {
        return (
            this.users.find((user) => user.email.equals(email)) ?? null
        );
    }

    async save(user: User): Promise<void> {
        this.users.push(user);
    }
}

class FakePasswordHasher implements PasswordHasher {
    async hash(plainTextPassword: string): Promise<string> {
        return `hashed:${plainTextPassword}`;
    }

    async compare(
        plainTextPassword: string,
        passwordHash: string,
    ): Promise<boolean> {
        return passwordHash === `hashed:${plainTextPassword}`;
    }
}

function createRegisterUserUseCase(): {
    useCase: RegisterUserUseCase;
    repository: InMemoryUserRepository;
} {
    const repository = new InMemoryUserRepository();
    const passwordHasher = new FakePasswordHasher();

    const useCase = new RegisterUserUseCase(
        repository,
        passwordHasher,
    );

    return {
        useCase,
        repository,
    };
}

describe("RegisterUserUseCase", () => {
    it("geçerli bilgilerle kullanıcı oluşturur", async () => {
        const { useCase, repository } = createRegisterUserUseCase();

        const result = await useCase.execute({
            name: "  Test Kullanıcısı  ",
            email: "  TEST.USER@EXAMPLE.COM  ",
            password: "Test1234!",
        });

        assert.equal(result.name, "Test Kullanıcısı");
        assert.equal(result.email, "test.user@example.com");
        assert.equal(repository.users.length, 1);

        const savedUser = repository.users[0];

        assert.ok(savedUser);
        assert.equal(savedUser.passwordHash, "hashed:Test1234!");
        assert.equal("passwordHash" in result, false);
    });

    it("aynı e-postayla ikinci kullanıcıyı oluşturmaz", async () => {
        const { useCase } = createRegisterUserUseCase();

        await useCase.execute({
            name: "İlk Kullanıcı",
            email: "duplicate@example.com",
            password: "Test1234!",
        });

        await assert.rejects(
            () =>
                useCase.execute({
                    name: "İkinci Kullanıcı",
                    email: "DUPLICATE@example.com",
                    password: "Test5678!",
                }),
            EmailAlreadyInUseError,
        );
    });

    it("geçersiz parolayı kabul etmez", async () => {
        const { useCase, repository } = createRegisterUserUseCase();

        await assert.rejects(
            () =>
                useCase.execute({
                    name: "Test Kullanıcısı",
                    email: "new.user@example.com",
                    password: "123",
                }),
            DomainError,
        );

        assert.equal(repository.users.length, 0);
    });
});