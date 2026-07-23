import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CategoryNotFoundError } from "../../src/application/errors/category-not-found.error.js";
import { TaskNotFoundError } from "../../src/application/errors/task-not-found.error.js";
import { ChangeTaskStatusUseCase } from "../../src/application/use-cases/change-task-status.use-case.js";
import { CreateTaskUseCase } from "../../src/application/use-cases/create-task.use-case.js";
import { DeleteTaskUseCase } from "../../src/application/use-cases/delete-task.use-case.js";
import { UpdateTaskUseCase } from "../../src/application/use-cases/update-task.use-case.js";
import { Category } from "../../src/domain/entities/category.js";
import type { Task } from "../../src/domain/entities/task.js";
import type { CategoryRepository } from "../../src/domain/repositories/category.repository.js";
import type { TaskRepository } from "../../src/domain/repositories/task.repository.js";

const ownerId =
    "11111111-1111-4111-8111-111111111111";

const anotherOwnerId =
    "22222222-2222-4222-8222-222222222222";

class InMemoryTaskRepository implements TaskRepository {
    readonly tasks: Task[] = [];

    async findByIdAndOwnerId(
        id: string,
        requestedOwnerId: string,
    ): Promise<Task | null> {
        return (
            this.tasks.find(
                (task) =>
                    task.id === id &&
                    task.ownerId === requestedOwnerId,
            ) ?? null
        );
    }

    async findAllByOwnerId(
        requestedOwnerId: string,
    ): Promise<Task[]> {
        return this.tasks.filter(
            (task) => task.ownerId === requestedOwnerId,
        );
    }

    async save(task: Task): Promise<void> {
        this.tasks.push(task);
    }

    async update(task: Task): Promise<void> {
        const taskIndex = this.tasks.findIndex(
            (storedTask) =>
                storedTask.id === task.id &&
                storedTask.ownerId === task.ownerId,
        );

        if (taskIndex >= 0) {
            this.tasks[taskIndex] = task;
        }
    }

    async deleteByIdAndOwnerId(
        id: string,
        requestedOwnerId: string,
    ): Promise<boolean> {
        const taskIndex = this.tasks.findIndex(
            (task) =>
                task.id === id &&
                task.ownerId === requestedOwnerId,
        );

        if (taskIndex < 0) {
            return false;
        }

        this.tasks.splice(taskIndex, 1);
        return true;
    }
}

class InMemoryCategoryRepository
    implements CategoryRepository
{
    readonly categories: Category[] = [];

    async findByIdAndOwnerId(
        id: string,
        requestedOwnerId: string,
    ): Promise<Category | null> {
        return (
            this.categories.find(
                (category) =>
                    category.id === id &&
                    category.ownerId === requestedOwnerId,
            ) ?? null
        );
    }

    async findByNameAndOwnerId(
        name: string,
        requestedOwnerId: string,
    ): Promise<Category | null> {
        return (
            this.categories.find(
                (category) =>
                    category.ownerId === requestedOwnerId &&
                    category.name.toLowerCase() ===
                    name.toLowerCase(),
            ) ?? null
        );
    }

    async save(category: Category): Promise<void> {
        this.categories.push(category);
    }
}

function createUseCases() {
    const taskRepository =
        new InMemoryTaskRepository();

    const categoryRepository =
        new InMemoryCategoryRepository();

    return {
        taskRepository,
        categoryRepository,

        createTaskUseCase: new CreateTaskUseCase(
            taskRepository,
            categoryRepository,
        ),

        updateTaskUseCase: new UpdateTaskUseCase(
            taskRepository,
            categoryRepository,
        ),

        changeTaskStatusUseCase:
            new ChangeTaskStatusUseCase(
                taskRepository,
            ),

        deleteTaskUseCase: new DeleteTaskUseCase(
            taskRepository,
        ),
    };
}

describe("UpdateTaskUseCase", () => {
    it("kullanıcı kendi görevini günceller", async () => {
        const {
            createTaskUseCase,
            updateTaskUseCase,
        } = createUseCases();

        const createdTask =
            await createTaskUseCase.execute({
                ownerId,
                title: "Eski görev başlığı",
            });

        const updatedTask =
            await updateTaskUseCase.execute({
                taskId: createdTask.id,
                ownerId,
                title: "Yeni görev başlığı",
                description: "Yeni açıklama",
                priority: "high",
                dueDate: "2026-08-15",
            });

        assert.equal(
            updatedTask.title,
            "Yeni görev başlığı",
        );
        assert.equal(
            updatedTask.description,
            "Yeni açıklama",
        );
        assert.equal(updatedTask.priority, "high");
        assert.equal(updatedTask.dueDate, "2026-08-15");
    });

    it("başka kullanıcıya ait kategoriyi kabul etmez", async () => {
        const {
            categoryRepository,
            createTaskUseCase,
            updateTaskUseCase,
        } = createUseCases();

        const category = Category.create({
            ownerId: anotherOwnerId,
            name: "Başkasının kategorisi",
            color: "#EF4444",
        });

        await categoryRepository.save(category);

        const createdTask =
            await createTaskUseCase.execute({
                ownerId,
                title: "Kategori atanacak görev",
            });

        await assert.rejects(
            () =>
                updateTaskUseCase.execute({
                    taskId: createdTask.id,
                    ownerId,
                    categoryId: category.id,
                }),
            CategoryNotFoundError,
        );
    });

    it("başka kullanıcının görevini güncellemez", async () => {
        const {
            createTaskUseCase,
            updateTaskUseCase,
        } = createUseCases();

        const createdTask =
            await createTaskUseCase.execute({
                ownerId,
                title: "Kullanıcıya özel görev",
            });

        await assert.rejects(
            () =>
                updateTaskUseCase.execute({
                    taskId: createdTask.id,
                    ownerId: anotherOwnerId,
                    title: "Yetkisiz değişiklik",
                }),
            TaskNotFoundError,
        );
    });
});

describe("ChangeTaskStatusUseCase", () => {
    it("görev durumunu tamamlandı olarak değiştirir", async () => {
        const {
            createTaskUseCase,
            changeTaskStatusUseCase,
        } = createUseCases();

        const createdTask =
            await createTaskUseCase.execute({
                ownerId,
                title: "Tamamlanacak görev",
            });

        const updatedTask =
            await changeTaskStatusUseCase.execute({
                taskId: createdTask.id,
                ownerId,
                status: "completed",
            });

        assert.equal(updatedTask.status, "completed");
    });
});

describe("DeleteTaskUseCase", () => {
    it("kullanıcı kendi görevini siler", async () => {
        const {
            taskRepository,
            createTaskUseCase,
            deleteTaskUseCase,
        } = createUseCases();

        const createdTask =
            await createTaskUseCase.execute({
                ownerId,
                title: "Silinecek görev",
            });

        await deleteTaskUseCase.execute({
            taskId: createdTask.id,
            ownerId,
        });

        assert.equal(taskRepository.tasks.length, 0);
    });

    it("başka kullanıcının görevini silmez", async () => {
        const {
            taskRepository,
            createTaskUseCase,
            deleteTaskUseCase,
        } = createUseCases();

        const createdTask =
            await createTaskUseCase.execute({
                ownerId,
                title: "Korunan görev",
            });

        await assert.rejects(
            () =>
                deleteTaskUseCase.execute({
                    taskId: createdTask.id,
                    ownerId: anotherOwnerId,
                }),
            TaskNotFoundError,
        );

        assert.equal(taskRepository.tasks.length, 1);
    });
});