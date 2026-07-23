import {
    useEffect,
    useState,
} from "react";
import { useNavigate } from "react-router";

import { CreateTaskForm } from "../components/tasks/CreateTaskForm";
import { EditTaskForm } from "../components/tasks/EditTaskForm";
import {
    clearAuthSession,
    getStoredUser,
} from "../services/auth-storage";
import {
    changeTaskStatus,
    deleteTask,
    getTasks,
    TaskApiError,
} from "../services/task.service";
import type {
    Task,
    TaskPriority,
    TaskStatus,
} from "../types/task";

const statusLabels: Record<TaskStatus, string> = {
    pending: "Bekliyor",
    in_progress: "Devam ediyor",
    completed: "Tamamlandı",
};

const priorityLabels: Record<TaskPriority, string> = {
    low: "Düşük",
    medium: "Orta",
    high: "Yüksek",
};

function formatDueDate(
    dueDate: string | null,
): string {
    if (!dueDate) {
        return "Son tarih yok";
    }

    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(`${dueDate}T00:00:00`));
}

export function DashboardPage() {
    const navigate = useNavigate();
    const user = getStoredUser();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    const [actionError, setActionError] =
        useState<string | null>(null);

    const [isCreateTaskOpen, setIsCreateTaskOpen] =
        useState(false);

    const [editingTask, setEditingTask] =
        useState<Task | null>(null);

    const [busyTaskId, setBusyTaskId] =
        useState<string | null>(null);

    useEffect(() => {
        const abortController = new AbortController();

        async function loadTasks(): Promise<void> {
            try {
                const loadedTasks = await getTasks(
                    abortController.signal,
                );

                setTasks(loadedTasks);
            } catch (error: unknown) {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                if (
                    error instanceof TaskApiError &&
                    error.statusCode === 401
                ) {
                    clearAuthSession();

                    navigate("/login", {
                        replace: true,
                        state: {
                            message:
                                "Oturumunun süresi doldu. Lütfen tekrar giriş yap.",
                        },
                    });

                    return;
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : "Görevler yüklenemedi.";

                setErrorMessage(message);
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadTasks();

        return () => {
            abortController.abort();
        };
    }, [navigate]);

    function handleApiError(error: unknown): void {
        if (
            error instanceof TaskApiError &&
            error.statusCode === 401
        ) {
            clearAuthSession();

            navigate("/login", {
                replace: true,
                state: {
                    message:
                        "Oturumunun süresi doldu. Lütfen tekrar giriş yap.",
                },
            });

            return;
        }

        const message =
            error instanceof Error
                ? error.message
                : "Görev işlemi gerçekleştirilemedi.";

        setActionError(message);
    }

    function replaceTask(updatedTask: Task): void {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === updatedTask.id
                    ? updatedTask
                    : task,
            ),
        );
    }

    function handleLogout(): void {
        clearAuthSession();

        navigate("/login", {
            replace: true,
        });
    }

    function handleTaskCreated(task: Task): void {
        setTasks((currentTasks) => [
            task,
            ...currentTasks,
        ]);

        setIsCreateTaskOpen(false);
        setActionError(null);
    }

    function handleTaskUpdated(task: Task): void {
        replaceTask(task);
        setEditingTask(null);
        setActionError(null);
    }

    async function handleToggleStatus(
        task: Task,
    ): Promise<void> {
        setBusyTaskId(task.id);
        setActionError(null);

        const nextStatus: TaskStatus =
            task.status === "completed"
                ? "pending"
                : "completed";

        try {
            const updatedTask =
                await changeTaskStatus(
                    task.id,
                    nextStatus,
                );

            replaceTask(updatedTask);
        } catch (error: unknown) {
            handleApiError(error);
        } finally {
            setBusyTaskId(null);
        }
    }

    async function handleDeleteTask(
        task: Task,
    ): Promise<void> {
        const isConfirmed = window.confirm(
            `"${task.title}" görevini silmek istediğine emin misin?`,
        );

        if (!isConfirmed) {
            return;
        }

        setBusyTaskId(task.id);
        setActionError(null);

        try {
            await deleteTask(task.id);

            setTasks((currentTasks) =>
                currentTasks.filter(
                    (currentTask) =>
                        currentTask.id !== task.id,
                ),
            );
        } catch (error: unknown) {
            handleApiError(error);
        } finally {
            setBusyTaskId(null);
        }
    }

    const activeTaskCount = tasks.filter(
        (task) => task.status !== "completed",
    ).length;

    const completedTaskCount = tasks.filter(
        (task) => task.status === "completed",
    ).length;

    return (
        <main className="dashboard-page">
            <header className="dashboard-header">
                <div className="brand dashboard-brand">
                    <span
                        className="brand-mark"
                        aria-hidden="true"
                    >
                        ✓
                    </span>

                    <span>TaskFlow</span>
                </div>

                <div className="dashboard-user">
                    <div>
                        <strong>
                            {user?.name ?? "Kullanıcı"}
                        </strong>
                        <span>{user?.email}</span>
                    </div>

                    <button
                        className="secondary-button"
                        type="button"
                        onClick={handleLogout}
                    >
                        Çıkış yap
                    </button>
                </div>
            </header>

            <section className="dashboard-content">
                <div className="dashboard-heading">
                    <div>
                        <span className="dashboard-kicker">
                            Görev alanın
                        </span>

                        <h1>
                            Hoş geldin,{" "}
                            {user?.name ?? "Kullanıcı"}
                        </h1>

                        <p>
                            Bugünkü işlerini gözden geçir ve
                            önceliklerine odaklan.
                        </p>
                    </div>

                    <button
                        className="primary-button dashboard-create-button"
                        type="button"
                        onClick={() =>
                            setIsCreateTaskOpen(true)
                        }
                    >
                        + Yeni görev
                    </button>
                </div>

                <div className="summary-grid">
                    <article className="summary-card">
                        <span>Toplam görev</span>
                        <strong>{tasks.length}</strong>
                    </article>

                    <article className="summary-card">
                        <span>Aktif görev</span>
                        <strong>{activeTaskCount}</strong>
                    </article>

                    <article className="summary-card">
                        <span>Tamamlanan</span>
                        <strong>{completedTaskCount}</strong>
                    </article>
                </div>

                {actionError && (
                    <p className="form-message form-message-error dashboard-action-error">
                        {actionError}
                    </p>
                )}

                <section className="task-panel">
                    <header className="task-panel-header">
                        <div>
                            <h2>Görevlerim</h2>
                            <p>
                                Yalnızca sana ait görevler
                                listeleniyor.
                            </p>
                        </div>
                    </header>

                    {isLoading && (
                        <div className="task-state">
                            Görevler yükleniyor...
                        </div>
                    )}

                    {errorMessage && (
                        <div className="task-state task-state-error">
                            {errorMessage}
                        </div>
                    )}

                    {!isLoading &&
                        !errorMessage &&
                        tasks.length === 0 && (
                            <div className="task-state">
                                Henüz bir görevin yok.
                            </div>
                        )}

                    {!isLoading &&
                        !errorMessage &&
                        tasks.length > 0 && (
                            <div className="task-list">
                                {tasks.map((task) => {
                                    const isBusy =
                                        busyTaskId ===
                                        task.id;

                                    return (
                                        <article
                                            className={`task-item ${
                                                task.status ===
                                                "completed"
                                                    ? "task-item-completed"
                                                    : ""
                                            }`}
                                            key={task.id}
                                        >
                                            <button
                                                className={`task-check task-check-${task.status}`}
                                                type="button"
                                                onClick={() =>
                                                    void handleToggleStatus(
                                                        task,
                                                    )
                                                }
                                                disabled={
                                                    isBusy
                                                }
                                                aria-label={
                                                    task.status ===
                                                    "completed"
                                                        ? "Görevi bekliyor durumuna al"
                                                        : "Görevi tamamla"
                                                }
                                            >
                                                {task.status ===
                                                "completed"
                                                    ? "✓"
                                                    : ""}
                                            </button>

                                            <div className="task-information">
                                                <div className="task-title-row">
                                                    <h3>
                                                        {
                                                            task.title
                                                        }
                                                    </h3>

                                                    <div className="task-actions">
                                                        <span
                                                            className={`status-badge status-${task.status}`}
                                                        >
                                                            {
                                                                statusLabels[
                                                                    task
                                                                        .status
                                                                    ]
                                                            }
                                                        </span>

                                                        <button
                                                            className="task-action-button"
                                                            type="button"
                                                            onClick={() =>
                                                                setEditingTask(
                                                                    task,
                                                                )
                                                            }
                                                            disabled={
                                                                isBusy
                                                            }
                                                        >
                                                            Düzenle
                                                        </button>

                                                        <button
                                                            className="task-action-button task-action-danger"
                                                            type="button"
                                                            onClick={() =>
                                                                void handleDeleteTask(
                                                                    task,
                                                                )
                                                            }
                                                            disabled={
                                                                isBusy
                                                            }
                                                        >
                                                            Sil
                                                        </button>
                                                    </div>
                                                </div>

                                                {task.description && (
                                                    <p>
                                                        {
                                                            task.description
                                                        }
                                                    </p>
                                                )}

                                                <div className="task-meta">
                                                    <span>
                                                        <i
                                                            className={`priority-dot priority-${task.priority}`}
                                                        />
                                                        {
                                                            priorityLabels[
                                                                task
                                                                    .priority
                                                                ]
                                                        }
                                                    </span>

                                                    <span>
                                                        {formatDueDate(
                                                            task.dueDate,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                </section>
            </section>

            {isCreateTaskOpen && (
                <CreateTaskForm
                    onTaskCreated={handleTaskCreated}
                    onCancel={() =>
                        setIsCreateTaskOpen(false)
                    }
                />
            )}

            {editingTask && (
                <EditTaskForm
                    task={editingTask}
                    onTaskUpdated={handleTaskUpdated}
                    onCancel={() =>
                        setEditingTask(null)
                    }
                />
            )}
        </main>
    );
}