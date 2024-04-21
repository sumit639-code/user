import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
//fs is a file system from node js

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadcloud = async (local) => {
  try {
    if (!local) return null;
    const res = await cloudinary.uploader.upload(local, {
      resource_type: "auto",
    });
    //file is been uploaded
    console.log("uploaded on cloudinary", res.url);
    return res;
  } catch (error) {
    fs.unlinkSync(local);
    //remove the local file that has been saved in local storage
    return null;
  }
};

export {uploadcloud}
