import type { NextFunction, Request, Response } from "express";
import sendResponse from "../utils/sendResponse";

const globalErrorHandler = (errors:Error, req:Request, res:Response, next:NextFunction) =>{
    sendResponse(res,{
        statusCode:500,
        success:false,
        message: errors.message || "Internal Server Error",
        errors
    })
}

export default globalErrorHandler;