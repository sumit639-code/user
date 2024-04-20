import mongoose, { mongo } from "mongoose";
import db_name from '../constants.js'
const connectDb = async () => {
  try {
    const connect = await mongoose.connect(
      `${process.env.MONGODB_URL}/${db_name}`
    );
    // console.log(connect);
    console.log(`Connection : ${connect.connection.host}`)
  } catch (error) {
    console.log("its not connecting");
    console.log(error);
    process.exit(111)
  }
};
export default connectDb;
