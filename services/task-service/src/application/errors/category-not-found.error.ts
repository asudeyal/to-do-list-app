export class CategoryNotFoundError extends Error {
    constructor() {
        super("Kategori bulunamadı veya kullanıcıya ait değil.");
        this.name = "CategoryNotFoundError";
    }
}