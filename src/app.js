import express, { urlencoded } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"10kb"}))//this for the limit if json data incoming
app.use(urlencoded())//this is used to get the encoder language be understanded by the express.
app.use(express.static("public"))//to store any file can store in a temporary folder in server.
app.use(cookieParser())//to get the cookies and read by the server securely.

app.get('/',(req,res)=>{
    // res.send()
    res.send("getting the root data");
})


//routes
import  Router from "./routes/user.route.js";
app.use("/users",Router)//routes  to be routed from the route folder



//routes Declaration

export default app;