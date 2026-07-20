export class EmailAlreadyInUseError extends Error {
    constructor() {
        super("Bu e-posta adresi zaten kullanılıyor.");
        this.name = "EmailAlreadyInUseError";
    }
}