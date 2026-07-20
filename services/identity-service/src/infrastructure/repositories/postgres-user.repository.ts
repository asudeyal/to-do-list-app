import type { Pool, QueryResultRow } from "pg";

import { User } from "../../domain/entities/user.js";
import type { UserRepository } from "../../domain/repositories/user.repository.js";
import type { Email } from "../../domain/value-objects/email.js";

interface UserRow extends QueryResultRow {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

export class PostgresUserRepository implements UserRepository {
    constructor(private readonly databasePool: Pool) {}

    async findByEmail(email: Email): Promise<User | null> {
        const result = await this.databasePool.query<UserRow>(
            `SELECT
                 id,
                 name,
                 email,
                 password_hash,
                 created_at,
                 updated_at
             FROM users
             WHERE LOWER(email) = $1
                 LIMIT 1`,
            [email.value],
        );

        const userRow = result.rows[0];

        if (!userRow) {
            return null;
        }

        return User.restore({
            id: userRow.id,
            name: userRow.name,
            email,
            passwordHash: userRow.password_hash,
            createdAt: userRow.created_at,
            updatedAt: userRow.updated_at,
        });
    }

    async save(user: User): Promise<void> {
        await this.databasePool.query(
            `INSERT INTO users (
                id,
                name,
                email,
                password_hash,
                created_at,
                updated_at
            )
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                user.id,
                user.name,
                user.email.value,
                user.passwordHash,
                user.createdAt,
                user.updatedAt,
            ],
        );
    }
}