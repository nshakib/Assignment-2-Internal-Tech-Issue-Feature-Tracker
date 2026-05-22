import type { NextFunction, Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issueService } from "./issue.service";

const createIssue = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const reporter_id = req.user.id;
        const {title, description, type} = req.body
        if (!title || !description || !type) {
            return sendResponse(res, { 
                statusCode: 400, 
                success: false, 
                message: "All fields are required" 
            });
        }
        const result = await issueService.createIssueIntoDB(req.body, reporter_id)

        sendResponse(res,{
            statusCode:201,
            success:true,
            message:"Issue created successfully",
            data:result.rows[0]
        })
    } catch (errors) {
        console.log("ERROR:", errors);
        next(errors)
    }
}

const getAllIssues = async(req: Request, res: Response, next:NextFunction)=>{
    try {
    const result = await issueService.getAllIssueFromDB(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (errors) {
        next(errors);
  }
}

export const issueController = {
    createIssue,
    getAllIssues,

}