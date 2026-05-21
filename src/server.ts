import app from "./app"
import config from "./config"
import { initDB } from "./db"

const main = () =>{
    initDB() //database call

    // server
    app.listen(config.port, ()=>{
        console.log(`Express server is running on port ${config.port}`)
    })
}

main();