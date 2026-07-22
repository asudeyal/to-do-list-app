import {
    useEffect,
    useState,
} from "react";
import { useNavigate } from "react-router";

import { CreateTaskForm } from "../components/tasks/CreateTaskForm";
import {
    clearAuthSession,
    getStoredUser,
} from "../services/auth-storage";
import {
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
    const [isCreateTaskOpen, setIsCreateTaskOpen] =
        useState(false);

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
                                {tasks.map((task) => (
                                    <article
                                        className="task-item"
                                        key={task.id}
                                    >
                                        <span
                                            className={`task-check task-check-${task.status}`}
                                            aria-hidden="true"
                                        >
                                            {task.status ===
                                            "completed"
                                                ? "✓"
                                                : ""}
                                        </span>

                                        <div className="task-information">
                                            <div className="task-title-row">
                                                <h3>
                                                    {task.title}
                                                </h3>

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
                                ))}
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
        </main>
    );
}