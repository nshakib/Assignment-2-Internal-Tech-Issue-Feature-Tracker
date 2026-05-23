import dotenv from "dotenv"
import path from "path"

dotenv.config({
    path:path.join(process.cwd(),".env")
});

const config = {
    connection_string:process.env.DATABASE_URL as string,
    port: process.env.PORT,
    secret:process.env.JWT_SECRET_KEY,
    client_url:process.env.CLIENT_URL,
}

export default config;