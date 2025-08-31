
export class AppError extends Error {
    public statusCode: number;
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.stack = new Error().stack;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}