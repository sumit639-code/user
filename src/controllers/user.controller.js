import { Users } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { async_handler } from "../utils/async_handler.js";
import { uploadcloud } from "../utils/fileupload.js";

const userRegister = async_handler(async (req, res) => {
  const { fullName, name, email, password } = req.body;
  console.log(name);

  // if(fullName===""){
  //   throw new ApiError(400,"FullName is Required")
  // }
  if (
    [fullName, name, email, password].some((feild) => {
      return feild?.trim() === "";
    })
  ) {
  }

  const existeduser =Users.findOne({
    $or:[{name},{email}]
  })
  if(existeduser){
    throw new ApiError(409,"user already existed")
  }

  const avatarfilepath = req.files?.avatar[0]?.path
  const coverfilepath = req.files?.coverimage[0]?.path

  if(!avatarfilepath){
    throw new ApiError(400,"file is required")
  }
  const avatar = await uploadcloud(avatarfilepath)
  const coverimage = await uploadcloud(coverfilepath)


  if(!avatar){
    throw new ApiError(400,"file is required")
  }
  Users.create({
    fullName,
    name,
    avatar:avatar.url,
    coverimage:coverimage?.url ||"",
    password,
  })
  res.status(200).json({
    message: name,
    email,
    fullName,
  });

});

export { userRegister };
