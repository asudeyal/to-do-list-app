export class CategoryAlreadyExistsError extends Error {
    constructor() {
        super("Bu isimde bir kategori zaten bulunuyor.");
        this.name = "CategoryAlreadyExistsError";
    }
}