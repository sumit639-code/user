import { asyncHandler } from "../utils/asyncHandler.js";
import { apierror } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";
const registerUser = asyncHandler(async (req, res) => {
  //register user steps
  //get user details from frontend/postman
  const { username, email, password, fullName } = req.body;
  console.log("username:", username);
  console.log("email", email);
  console.log("Password", email);
  console.log("Password", fullName);
  //validation if any required fields are empty or any proper format
  if (
    [username, email, password].some((fn) => {
      fn?.trim() === "";
    })
  ) {
    throw new apierror(400, "all fields are required");
  }
  //check if user already exists:username
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  }); //in this a $ is a javascript method used to check the username and email.
  if (existedUser) {
    throw new apierror(409, "username and email is existed");
  }
  //check if coverimage and avater
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverimgPath = req.files?.coverimage[0]?.path;
  let coverimgPath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverimgPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    throw new apierror(409, "avatar file is required");
  }
  //if the image is there then the upload to cloudinary,avater check

  const avatar = await uploadOnCloud(avatarLocalPath);
  const coverimg = await uploadOnCloud(coverimgPath);
  if (!avatar) {
    throw new apierror(409, "avatar feild is required");
  }
  //create user object -create entry in db for uploadign to mongo db
  const user = await User.create({
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverimg: coverimg?.url || "",
    email,
    password,
    fullName,
  });

  //remove password and refresh token field from response.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  if (!createdUser) {
    throw new apierror(400, "retry registering");
  }
  //check if the response is there for user creation.
  return res
    .status(201)
    .json(new apiresponse(200, createdUser, "user Registered :)"));
  //return response.
});

export { registerUser };
