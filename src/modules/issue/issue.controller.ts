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
        next(errors)
    }
}

const getAllIssues = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
      const result = await issueService.getAllIssueFromDB(req.query);

      sendResponse(res, {
        statusCode: 200,
        success: true,
        data: result,
      });
    } catch (errors) {
        next(errors);
    }
};


const getSingleIssue = async (req: Request, res: Response, next:NextFunction) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id as string);
    
    if (!result) {
        return sendResponse(res,{
            statusCode:404,
            success:false,
            message:"Issue not found",
        })
    }

    sendResponse(res,{
        statusCode:200,
        success:true,
        data:result
    })
  } catch (errors) {
    next(errors);
  }
};

const updateIssue = async (req: Request, res: Response, next:NextFunction) => {
  const { id } = req.params;

  try {
    const result = await issueService.updateIssueFromDB(
      req.body, id as string, req.user.id, req.user.role, 
    );

    if (!result) {
      return sendResponse(res,{
        statusCode:404,
        success:false,
        message:"Issue not found",
        data:result
      })
    }

    
    sendResponse(res,{
        statusCode:200,
        success:true,
        message: "Issue updated successfully",
        data:result
    })
  } catch (errors:unknown) {
        if (errors instanceof Error) {
            if (errors.message === "FORBIDDEN") {
                return sendResponse(res, {
                    statusCode: 403,
                    success: false,
                    message: "You are not allowed to update this issue",
                });
            }
            if (errors.message === "CONFLICT") {
                return sendResponse(res, {
                    statusCode: 409,
                    success: false,
                    message: "Only open issues can be updated",
                });
            }
        }
        next(errors)
  }
};

const deleteIssue = async (req: Request, res: Response, next:NextFunction) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id as string);

    if (!result) {
      return sendResponse(res,{
        statusCode:404,
        success:false,
        message:"Issue not found",
        data:result
      })
    }

    sendResponse(res,{
        statusCode:200,
        success:true,
        message: "Issue deleted successfully",
    })
  } catch (errors) {
      next(errors)
  }
};


export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue

}