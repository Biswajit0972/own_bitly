export class AppResponse<T, > {
    message: string;
    data?: T;
    statusCode: number;
    status?: boolean;

    constructor(status:boolean = true,message: string, data?: T, statusCode: number = 200) {
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
        this.status = status;
    }
}