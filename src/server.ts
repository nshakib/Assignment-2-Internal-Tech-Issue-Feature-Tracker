import app from "./app"
import config from "./config"
import { initDB } from "./db"

const main = async() =>{
    await initDB();
    app.listen(config.port, ()=>{
        console.log(`Express server is running on port ${config.port}`)
    })
}

main();