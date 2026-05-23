import config from "../../config";
import { pool } from "../../db";
import type { IUser } from "./auth.interface"
import bcrypt from "bcrypt"
import jwt,{ type JwtPayload} from "jsonwebtoken"


const createUserIntoDB = async(payload:IUser) =>{
    const {name, email, password, role} = payload;
    const hashPassword = await bcrypt.hash(password,10);

    const existing = await pool.query(
        `SELECT id FROM users WHERE email = $1`,
        [email]
    );

    if (existing.rows.length > 0) {
       throw new Error("Email already exists");
    }

    const result = await pool.query(`
        INSERT INTO users (name, email, password, role) VALUES($1,$2,$3,COALESCE($4,'contributor'))
        RETURNING id, name, email, role, created_at, updated_at
        `,
        [name, email, hashPassword, role]
    );
    return result;
}

const loginUserIntoDB = async(payload:{
    email:string;
    password: string;
}) =>{
        const {email, password} = payload;
        
        // 1. Check if the user exists
        const userData = await pool.query(
            `
            SELECT id, name, email, role, password, created_at, updated_at FROM users WHERE email=$1
            `,
            [email],
        );
        if (userData.rows.length === 0) {
            throw new Error("Invalid Credentials!");
        }

        // 2. Compare the password -> Done
        const user = userData.rows[0];
        const matchPassword = await bcrypt.compare(password, user.password);

        if (!matchPassword) {
            throw new Error("Invalid Credentials!");
        }

        //3. Generate Token
        const jwtPayload = {
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email,
        };

        const token = jwt.sign(jwtPayload, config.secret as string, {
            expiresIn: "1d",
        });

        return{
            token,
            user:{
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at,
            }
        };
};

export const authService ={
    createUserIntoDB,
    loginUserIntoDB,
}