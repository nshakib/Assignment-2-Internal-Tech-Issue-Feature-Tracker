import type { Response, Request, NextFunction } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";

const signup = async(req:Request, res:Response, next:NextFunction) =>{
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return sendResponse(res, { 
                statusCode: 400, 
                success: false, 
                message: "All fields are required" 
            });
        }
        const result = await authService.createUserIntoDB(req.body)

        sendResponse(res,{
            statusCode:201,
            success:true,
            message:"User registered successfully",
            data:result.rows[0]
        })
    } catch (errors:unknown) {
        next(errors)
    }
}

const login = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return sendResponse(res, {
                statusCode: 400,
                success: false,
                message: "Email and password are required"
            });
        }
        const result = await authService.loginUserIntoDB(req.body);

        sendResponse(res,{
            statusCode:200,
            success:true,
            message:"Login successful",
            data:result
        })
    } catch (errors) {
        next(errors)
    }
}

export const authController = {
    signup,
    login
}