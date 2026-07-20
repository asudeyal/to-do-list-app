export class InvalidAccessTokenError extends Error {
    constructor() {
        super("Geçersiz veya süresi dolmuş erişim tokenı.");
        this.name = "InvalidAccessTokenError";
    }
}