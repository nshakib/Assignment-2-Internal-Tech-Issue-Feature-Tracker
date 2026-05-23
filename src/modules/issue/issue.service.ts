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

const getAllIssueFromDB = async(query:{
    sort?:string;
    type?:string;
    status?: string;
})=>{

     // Step 1 — build WHERE clause dynamically
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (query.type) {
        values.push(query.type);
        conditions.push(`type = $${values.length}`);
    }

    if (query.status) {
        values.push(query.status);
        conditions.push(`status = $${values.length}`);
    }

    const whereClause = conditions.length 
        ? `WHERE ${conditions.join(" AND ")}` 
        : "";

    // Step 2 — sort order
    const orderBy = query.sort === "oldest" ? "ASC" : "DESC";

     // Step 3 — fetch issues
    const issuesResult = await pool.query(`
        SELECT id, title, description, type, status, reporter_id, created_at, updated_at 
        FROM issues
        ${whereClause}
        ORDER BY created_at ${orderBy}
    `,values);

    const issues = issuesResult.rows;

    // Step 4 — extract reporter IDs
    const reporterIds = issues.map(issue => issue.reporter_id);
    const reportersResult = await pool.query(
        `SELECT id, name, role FROM users WHERE id = ANY($1)`,
        [reporterIds]
    );

    // Step 5 — combine
    const resultData = issues.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reportersResult.rows.find(r => r.id === issue.reporter_id),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    }));

    return resultData;
}

const getSingleIssueFromDB = async(id:string)=>{
    
    const result = await pool.query(`

        SELECT id, title, description, type, status, reporter_id, created_at, updated_at 
        FROM issues WHERE id = $1 
        
        `,
        [id],
    );
    const issue = result.rows[0];

    if (!issue) return null; // ← let controller handle 404

    const reporterResult = await pool.query(
        `SELECT id, name, role FROM users WHERE id = $1`,
        [issue.reporter_id]
    );

    return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporterResult.rows[0],
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    };
}

const updateIssueFromDB = async(payload:IIssue, id:string, userId:number, userRole:string)=>{
    const { title, description, type,status } = payload;

    // Step 1 — fetch existing issue
    const issueResult = await pool.query(
        `SELECT * FROM issues WHERE id = $1`,
        [id]
    );
    
    const issue = issueResult.rows[0];
    // Step 2 — 404 if not found
    if (!issue) return null;

    // Step 3 — permission checks for contributor
    if (userRole === "contributor") {
        if (issue.reporter_id !== userId) {
            throw new Error("FORBIDDEN");
        }
        if (issue.status !== "open") {
            throw new Error("CONFLICT");
        }
    }

    const result = await pool.query(
        `
        UPDATE issues 
        SET 
        title=COALESCE($1,title),
        description=COALESCE($2,description),
        type=COALESCE($3,type),
        status=COALESCE($4,status),
        updated_at = NOW()

        WHERE id=$5 
        RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
        `,
        [title, description, type, status,id],
    );

    return result.rows[0];;
}

export const issueService={
    createIssueIntoDB,
    getAllIssueFromDB,
    getSingleIssueFromDB,
    updateIssueFromDB,


}