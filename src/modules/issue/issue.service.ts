import { pool } from "../../db";
import type { IIssue } from "./issue.interface";


const createIssueIntoDB = async(payload:IIssue, reporter_id:number)=>{
    const {title, description, type} = payload;

    const result = await pool.query(`
        INSERT INTO issues(title,description,type,reporter_id)
        VALUES($1, $2, $3, $4 )
        RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `,
        [title,description,type, reporter_id]
    );
    return result;
}

export const issueService={
    createIssueIntoDB,
}