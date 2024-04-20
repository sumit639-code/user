import dotenv from "dotenv";

// import  mongoose, { mongo } from "mongoose";
import connectDb from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "./env",
});

connectDb()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("listning");
    });
  })
  .catch((err) => console.log(err));
// (async()=>{
// try {
//     await mongoose.connect('${process.env.MONGODB_URL}/${DB_NAME}')
// } catch (error) {
//     console.log(error);
//     throw error
// }
// })()
