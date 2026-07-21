import type { Pool, QueryResultRow } from "pg";

import { Task } from "../../domain/entities/task.js";
import type { TaskRepository } from "../../domain/repositories/task.repository.js";

interface TaskRow extends QueryResultRow {
    id: string;
    owner_id: string;
    category_id: string | null;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    due_date: string | null;
    created_at: Date;
    updated_at: Date;
}

export class PostgresTaskRepository
    implements TaskRepository
{
    constructor(private readonly databasePool: Pool) {}

    async findByIdAndOwnerId(
        id: string,
        ownerId: string,
    ): Promise<Task | null> {
        const result = await this.databasePool.query<TaskRow>(
            `SELECT
         id,
         owner_id,
         category_id,
         title,
         description,
         status,
         priority,
         due_date::text AS due_date,
         created_at,
         updated_at
       FROM tasks
       WHERE id = $1
         AND owner_id = $2
       LIMIT 1`,
            [id, ownerId],
        );

        const taskRow = result.rows[0];

        if (!taskRow) {
            return null;
        }

        return this.restoreTask(taskRow);
    }

    async findAllByOwnerId(ownerId: string): Promise<Task[]> {
        const result = await this.databasePool.query<TaskRow>(
            `SELECT
         id,
         owner_id,
         category_id,
         title,
         description,
         status,
         priority,
         due_date::text AS due_date,
         created_at,
         updated_at
       FROM tasks
       WHERE owner_id = $1
       ORDER BY created_at DESC`,
            [ownerId],
        );

        return result.rows.map((taskRow) =>
            this.restoreTask(taskRow),
        );
    }

    async save(task: Task): Promise<void> {
        await this.databasePool.query(
            `INSERT INTO tasks (
         id,
         owner_id,
         category_id,
         title,
         description,
         status,
         priority,
         due_date,
         created_at,
         updated_at
       )
       VALUES (
         $1, $2, $3, $4, $5,
         $6, $7, $8, $9, $10
       )`,
            [
                task.id,
                task.ownerId,
                task.categoryId,
                task.title,
                task.description,
                task.status,
                task.priority,
                task.dueDate,
                task.createdAt,
                task.updatedAt,
            ],
        );
    }

    private restoreTask(taskRow: TaskRow): Task {
        return Task.restore({
            id: taskRow.id,
            ownerId: taskRow.owner_id,
            categoryId: taskRow.category_id,
            title: taskRow.title,
            description: taskRow.description,
            status: taskRow.status,
            priority: taskRow.priority,
            dueDate: taskRow.due_date,
            createdAt: taskRow.created_at,
            updatedAt: taskRow.updated_at,
        });
    }
}