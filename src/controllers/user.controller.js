import { asyncHandler } from "../utils/asyncHandler.js";
import { apierror } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";
const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    console.log(accessToken);
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new apierror(
      500,
      "something went wrong while generating refresh token",
      err
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //register user steps
  //get user details from frontend/postman

  const { username, email, password, fullName } = req.body;
  // console.log("username:", username);
  // console.log("email", email);
  // console.log("Password", email);
  // console.log("fullname", fullName);
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
  }); //in this a $ is a mongodb method used to check the username and email. if either field is present or not.
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
  // console.log(user);

  // console.log()
  //remove password and refresh token field from response.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
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
const loginUser = asyncHandler(async (req, res) => {
  //login steps
  //login user name , password
  //get daya from req body -> data
  const { username, password, email } = req.body;
  console.log(req.body.username);
  if (!(username || email)) {
    throw new apierror(400, "username is requiered");
  }

  //find the user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new apierror(404, "user is not registered");
  }
  //password check
  const passvalid = await user.isPasswordCorrect(password);
  if (!passvalid) {
    throw new apierror(404, "password is incorrect");
  }
  //access and refresh token generate and send
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //send token to cookie
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiresponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user Logged In Successfully"
      )
    );
  //response
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiresponse(200, {}, "user LOgged out"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new apierror(401, "unauthorised rerquest");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new apierror(401, "Invalid Token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apierror(401, "refresh token is expired");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newrefreshToken } =
      await generateAccessandRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new apiresponse(
          200,
          { accessToken, newrefreshToken },
          "access token refreshed"
        )
      );
  } catch (error) {
    throw new apierror(403, error?.message || "invalid refresh token");
  }
});
export { registerUser, loginUser, logoutUser, refreshAccessToken };
