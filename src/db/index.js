import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
// import dotenv from 'dotenv'
import experss from 'express';
const app = experss();
const connect_db = async()=>{
    try{
        const connect_dbc = await mongoose.connect(`mongodb+srv://sumitkkumar639:surath76@cluster0.yfpyxjy.mongodb.net/${DB_NAME}`)
        console.log(connect_dbc.connection.host)
        
    }catch(error){
        console.log(error,"not connected")
    }
}


export default connect_db;