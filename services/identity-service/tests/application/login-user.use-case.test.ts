import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { InvalidCredentialsError } from "../../src/application/errors/invalid-credentials.error.js";
import type { PasswordHasher } from "../../src/application/ports/password-hasher.js";
import type {
    AccessTokenPayload,
    TokenGenerator,
} from "../../src/application/ports/token-generator.js";
import { LoginUserUseCase } from "../../src/application/use-cases/login-user.use-case.js";
import { User } from "../../src/domain/entities/user.js";
import type { UserRepository } from "../../src/domain/repositories/user.repository.js";
import { Email } from "../../src/domain/value-objects/email.js";

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

class FakeTokenGenerator implements TokenGenerator {
    lastPayload: AccessTokenPayload | null = null;

    async generate(payload: AccessTokenPayload): Promise<string> {
        this.lastPayload = payload;

        return `test-token:${payload.userId}`;
    }
}

async function createTestContext(): Promise<{
    useCase: LoginUserUseCase;
    tokenGenerator: FakeTokenGenerator;
}> {
    const repository = new InMemoryUserRepository();
    const passwordHasher = new FakePasswordHasher();
    const tokenGenerator = new FakeTokenGenerator();

    const user = User.create({
        name: "Test Kullanıcısı",
        email: Email.create("test.user@example.com"),
        passwordHash: await passwordHasher.hash("Test1234!"),
    });

    await repository.save(user);

    return {
        useCase: new LoginUserUseCase(
            repository,
            passwordHasher,
            tokenGenerator,
        ),
        tokenGenerator,
    };
}

describe("LoginUserUseCase", () => {
    it("doğru bilgilerle kullanıcıya erişim tokenı üretir", async () => {
        const { useCase, tokenGenerator } =
            await createTestContext();

        const result = await useCase.execute({
            email: "TEST.USER@example.com",
            password: "Test1234!",
        });

        assert.equal(result.user.email, "test.user@example.com");
        assert.match(result.accessToken, /^test-token:/);
        assert.equal(
            tokenGenerator.lastPayload?.email,
            "test.user@example.com",
        );
    });

    it("yanlış parolayı kabul etmez", async () => {
        const { useCase } = await createTestContext();

        await assert.rejects(
            () =>
                useCase.execute({
                    email: "test.user@example.com",
                    password: "YanlisParola!",
                }),
            InvalidCredentialsError,
        );
    });

    it("kayıtlı olmayan e-postayı kabul etmez", async () => {
        const { useCase } = await createTestContext();

        await assert.rejects(
            () =>
                useCase.execute({
                    email: "unknown@example.com",
                    password: "Test1234!",
                }),
            InvalidCredentialsError,
        );
    });
});