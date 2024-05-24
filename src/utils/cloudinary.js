import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //filehandling in node js
import { isNull } from "util";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloud = async (localfilepath) => {
  try {
    if (!localfilepath) return null;
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    console.log("file has been uploaded", response.url);
    return response;
  } catch (error) {
    fs.unlinkSunc(localfilepath); //remove the file from locaaly saved in server.
    return null;
  }
};
export { uploadOnCloud };
