import {
    type FormEvent,
    useState,
} from "react";

import { updateTask } from "../../services/task.service";
import type {
    Task,
    TaskPriority,
} from "../../types/task";

interface EditTaskFormProps {
    task: Task;
    onTaskUpdated: (task: Task) => void;
    onCancel: () => void;
}

export function EditTaskForm({
                                 task,
                                 onTaskUpdated,
                                 onCancel,
                             }: EditTaskFormProps) {
    const [title, setTitle] =
        useState(task.title);

    const [description, setDescription] =
        useState(task.description ?? "");

    const [priority, setPriority] =
        useState<TaskPriority>(task.priority);

    const [dueDate, setDueDate] =
        useState(task.dueDate ?? "");

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            const updatedTask = await updateTask(
                task.id,
                {
                    title: title.trim(),
                    description:
                        description.trim() || null,
                    priority,
                    dueDate: dueDate || null,
                },
            );

            onTaskUpdated(updatedTask);
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Görev güncellenemedi.";

            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="modal-backdrop">
            <section
                className="modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-task-title"
            >
                <header className="modal-header">
                    <div>
                        <span className="dashboard-kicker">
                            Görev düzenleme
                        </span>

                        <h2 id="edit-task-title">
                            Görevi güncelle
                        </h2>
                    </div>

                    <button
                        className="modal-close-button"
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        aria-label="Formu kapat"
                    >
                        ×
                    </button>
                </header>

                {errorMessage && (
                    <p className="form-message form-message-error">
                        {errorMessage}
                    </p>
                )}

                <form
                    className="create-task-form"
                    onSubmit={handleSubmit}
                >
                    <label className="form-field">
                        <span>Görev başlığı</span>

                        <input
                            type="text"
                            value={title}
                            onChange={(event) =>
                                setTitle(
                                    event.target.value,
                                )
                            }
                            maxLength={200}
                            disabled={isSubmitting}
                            autoFocus
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Açıklama</span>

                        <textarea
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value,
                                )
                            }
                            rows={4}
                            maxLength={2000}
                            disabled={isSubmitting}
                        />
                    </label>

                    <div className="task-form-grid">
                        <label className="form-field">
                            <span>Öncelik</span>

                            <select
                                value={priority}
                                onChange={(event) =>
                                    setPriority(
                                        event.target
                                            .value as
                                            TaskPriority,
                                    )
                                }
                                disabled={isSubmitting}
                            >
                                <option value="low">
                                    Düşük
                                </option>
                                <option value="medium">
                                    Orta
                                </option>
                                <option value="high">
                                    Yüksek
                                </option>
                            </select>
                        </label>

                        <label className="form-field">
                            <span>Son tarih</span>

                            <input
                                type="date"
                                value={dueDate}
                                onChange={(event) =>
                                    setDueDate(
                                        event.target.value,
                                    )
                                }
                                disabled={isSubmitting}
                            />
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button
                            className="secondary-button"
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Vazgeç
                        </button>

                        <button
                            className="primary-button modal-submit-button"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Güncelleniyor..."
                                : "Değişiklikleri kaydet"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
