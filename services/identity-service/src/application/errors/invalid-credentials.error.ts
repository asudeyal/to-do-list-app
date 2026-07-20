export class InvalidCredentialsError extends Error {
    constructor() {
        super("E-posta veya parola hatalı.");
        this.name = "InvalidCredentialsError";
    }
}