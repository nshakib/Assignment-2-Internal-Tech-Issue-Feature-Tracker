import dotenv from "dotenv"
import path from "path"

dotenv.config({
    path:path.join(process.cwd(),".env.local")
});

const config = {
    connection_string:process.env.DATABASE_URL as string,
    port: process.env.PORT,
    secret:process.env.JWT_SECRET_KEY,
    refresh_secret:process.env.JWT_REFRESH_SECRET_KEY,
}

export default config;