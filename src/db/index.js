import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
// import dotenv from 'dotenv'
import experss from "express";
const app = experss();
const connect_db = async () => {
  try {
    const connect_dbc = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(connect_dbc.connection.host);
  } catch (error) {
    console.log(error, "not connected");
  }
};

export default connect_db;
