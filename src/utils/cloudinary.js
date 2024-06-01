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
    console.log("file has been uploaded", response);
    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    fs.unlinkSync(localfilepath); //remove the file from locaaly saved in server.
    return null;
  }
};

const deleteOldFile = async (url) => {
  try {
    if (!url) {
      return console.log("url is not present");
    }
    const response = await cloudinary.uploader.destroy(url);

    console.log("the file has been deleted");
    return console.log("work has been done");
  } catch (error) {
    return console.log("there is some error in file scanning", error);
  }
};
export { uploadOnCloud, deleteOldFile };
