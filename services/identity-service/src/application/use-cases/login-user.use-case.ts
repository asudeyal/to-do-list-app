import { InvalidCredentialsError } from "../errors/invalid-credentials.error.js";
import type { PasswordHasher } from "../ports/password-hasher.js";
import type { TokenGenerator } from "../ports/token-generator.js";
import type { UserRepository } from "../../domain/repositories/user.repository.js";
import { Email } from "../../domain/value-objects/email.js";

export interface LoginUserInput {
    email: string;
    password: string;
}

export interface LoginUserOutput {
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export class LoginUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
        private readonly tokenGenerator: TokenGenerator,
    ) {}

    async execute(input: LoginUserInput): Promise<LoginUserOutput> {
        const email = Email.create(input.email);

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new InvalidCredentialsError();
        }

        const passwordMatches = await this.passwordHasher.compare(
            input.password,
            user.passwordHash,
        );

        if (!passwordMatches) {
            throw new InvalidCredentialsError();
        }

        const accessToken = await this.tokenGenerator.generate({
            userId: user.id,
            email: user.email.value,
        });

        return {
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email.value,
            },
        };
    }
}