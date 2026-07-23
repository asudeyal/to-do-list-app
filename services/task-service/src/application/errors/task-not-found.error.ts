export class TaskNotFoundError extends Error {
    constructor() {
        super("Görev bulunamadı veya kullanıcıya ait değil.");
        this.name = "TaskNotFoundError";
    }
}