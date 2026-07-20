import type { User } from "../entities/user.js";
import type { Email } from "../value-objects/email.js";

export interface UserRepository {
    findByEmail(email: Email): Promise<User | null>;

    save(user: User): Promise<void>;
}