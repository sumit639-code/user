import dotenv from 'dotenv';
import connect_db from "./db/index.js";
import app from './app.js';
// import { DB_NAME } from "./constants.js";
dotenv.config({
    path:"./env",
})
connect_db()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log("server is running");
    })
})
.catch((Err)=>console.log(Err))