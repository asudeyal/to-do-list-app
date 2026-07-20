import { EmailAlreadyInUseError } from "../errors/email-already-in-use.error.js";
import type { PasswordHasher } from "../ports/password-hasher.js";
import { User } from "../../domain/entities/user.js";
import type { UserRepository } from "../../domain/repositories/user.repository.js";
import { Email } from "../../domain/value-objects/email.js";
import { Password } from "../../domain/value-objects/password.js";

export interface RegisterUserInput {
    name: string;
    email: string;
    password: string;
}

export interface RegisterUserOutput {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}

export class RegisterUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
        const email = Email.create(input.email);
        const password = Password.create(input.password);

        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw new EmailAlreadyInUseError();
        }

        const passwordHash = await this.passwordHasher.hash(password.value);

        const user = User.create({
            name: input.name,
            email,
            passwordHash,
        });

        await this.userRepository.save(user);

        return {
            id: user.id,
            name: user.name,
            email: user.email.value,
            createdAt: user.createdAt,
        };
    }
}