import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Category } from "../../src/domain/entities/category.js";
import type { Task } from "../../src/domain/entities/task.js";
import type { CategoryRepository } from "../../src/domain/repositories/category.repository.js";
import type { TaskRepository } from "../../src/domain/repositories/task.repository.js";
import { CategoryNotFoundError } from "../../src/application/errors/category-not-found.error.js";
import { CreateTaskUseCase } from "../../src/application/use-cases/create-task.use-case.js";
import { ListTasksUseCase } from "../../src/application/use-cases/list-tasks.use-case.js";

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
                    category.name.toLowerCase() === name.toLowerCase(),
            ) ?? null
        );
    }

    async save(category: Category): Promise<void> {
        this.categories.push(category);
    }
}

function createUseCases() {
    const taskRepository = new InMemoryTaskRepository();
    const categoryRepository =
        new InMemoryCategoryRepository();

    return {
        taskRepository,
        categoryRepository,
        createTaskUseCase: new CreateTaskUseCase(
            taskRepository,
            categoryRepository,
        ),
        listTasksUseCase: new ListTasksUseCase(
            taskRepository,
        ),
    };
}

describe("CreateTaskUseCase", () => {
    it("geçerli bilgilerle görev oluşturur", async () => {
        const {
            categoryRepository,
            createTaskUseCase,
        } = createUseCases();

        const category = Category.create({
            ownerId,
            name: "Staj",
            color: "#3B82F6",
        });

        await categoryRepository.save(category);

        const task = await createTaskUseCase.execute({
            ownerId,
            title: "Görev servisini tamamla",
            description: "Endpointleri doğrula",
            priority: "high",
            dueDate: "2026-07-31",
            categoryId: category.id,
        });

        assert.equal(task.title, "Görev servisini tamamla");
        assert.equal(task.status, "pending");
        assert.equal(task.priority, "high");
        assert.equal(task.categoryId, category.id);
        assert.equal(task.dueDate, "2026-07-31");
    });

    it("kullanıcıya ait olmayan kategoriyi kabul etmez", async () => {
        const {
            categoryRepository,
            createTaskUseCase,
        } = createUseCases();

        const anotherUsersCategory = Category.create({
            ownerId: anotherOwnerId,
            name: "Kişisel",
            color: "#10B981",
        });

        await categoryRepository.save(
            anotherUsersCategory,
        );

        await assert.rejects(
            () =>
                createTaskUseCase.execute({
                    ownerId,
                    title: "Geçersiz kategorili görev",
                    categoryId: anotherUsersCategory.id,
                }),
            CategoryNotFoundError,
        );
    });

    it("kategori olmadan görev oluşturur", async () => {
        const { createTaskUseCase } = createUseCases();

        const task = await createTaskUseCase.execute({
            ownerId,
            title: "Kategorisiz görev",
        });

        assert.equal(task.categoryId, null);
        assert.equal(task.priority, "medium");
        assert.equal(task.status, "pending");
    });
});

describe("ListTasksUseCase", () => {
    it("yalnızca ilgili kullanıcının görevlerini listeler", async () => {
        const {
            createTaskUseCase,
            listTasksUseCase,
        } = createUseCases();

        await createTaskUseCase.execute({
            ownerId,
            title: "Birinci kullanıcının görevi",
        });

        await createTaskUseCase.execute({
            ownerId: anotherOwnerId,
            title: "İkinci kullanıcının görevi",
        });

        const tasks = await listTasksUseCase.execute(ownerId);

        assert.equal(tasks.length, 1);
        assert.equal(
            tasks[0]?.title,
            "Birinci kullanıcının görevi",
        );
    });
});