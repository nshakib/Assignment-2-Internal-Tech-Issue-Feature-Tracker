import type { Response } from "express";

type TResponse<T> = {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown;
}

const sendResponse = <T>(res:Response,  responseData:TResponse<T>) => {
    res.status( responseData.statusCode).json({
        success:  responseData.success,
        message:  responseData.message,
        data:  responseData.data,
        errors:  responseData.errors,
    });
}

export default sendResponse;