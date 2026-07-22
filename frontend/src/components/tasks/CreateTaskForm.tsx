import {
    type FormEvent,
    useState,
} from "react";

import { createTask } from "../../services/task.service";
import type {
    Task,
    TaskPriority,
} from "../../types/task";

interface CreateTaskFormProps {
    onTaskCreated: (task: Task) => void;
    onCancel: () => void;
}

export function CreateTaskForm({
                                   onTaskCreated,
                                   onCancel,
                               }: CreateTaskFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] =
        useState("");
    const [priority, setPriority] =
        useState<TaskPriority>("medium");
    const [dueDate, setDueDate] = useState("");
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
            const task = await createTask({
                title: title.trim(),
                description: description.trim() || null,
                priority,
                dueDate: dueDate || null,
                categoryId: null,
            });

            onTaskCreated(task);
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Görev oluşturulamadı.";

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
                aria-labelledby="create-task-title"
            >
                <header className="modal-header">
                    <div>
            <span className="dashboard-kicker">
              Yeni görev
            </span>
                        <h2 id="create-task-title">
                            Görev oluştur
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
                                setTitle(event.target.value)
                            }
                            placeholder="Örneğin: Proje raporunu tamamla"
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
                                setDescription(event.target.value)
                            }
                            placeholder="Görevle ilgili kısa bir açıklama"
                            rows={4}
                            maxLength={1000}
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
                                        event.target.value as TaskPriority,
                                    )
                                }
                                disabled={isSubmitting}
                            >
                                <option value="low">Düşük</option>
                                <option value="medium">Orta</option>
                                <option value="high">Yüksek</option>
                            </select>
                        </label>

                        <label className="form-field">
                            <span>Son tarih</span>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(event) =>
                                    setDueDate(event.target.value)
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
                                ? "Oluşturuluyor..."
                                : "Görevi oluştur"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}