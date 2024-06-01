import { asyncHandler } from "../utils/asyncHandler.js";
import { apierror } from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { deleteOldFile, uploadOnCloud } from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";
import { application, json } from "express";
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
  // console.log("Password", password);
  // console.log("fullname", fullName);
  console.log("fullname", req.files);
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
  // console.log(existedUser)

  //check if coverimage and avater
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverimgPath = req.files?.coverimage[0]?.path;
  let coverimgPath;
  console.log(req.files);
  console.log(coverimgPath);
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length >= 0
  ) {
    coverimgPath = req.files.coverImage[0].path;
  }
  // console.log(coverimgPath);
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
    coverImage: coverimg?.url || "",
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
      refreshToken: "",
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
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const passwordCheck = await user.isPasswordCorrect(oldPassword);
  if (!passwordCheck) {
    throw new apierror(400, "invalid old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiresponse(200, {}, "password changed successfully"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!(fullName || email)) {
    throw new apierror(400, "all feilds are required");
  }
  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      fullName: fullName,
      email: email,
    },
  }).select("-password ");
  return res.status(200).json(apiresponse(200, user, "user details updated"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new apierror(402, "avatar file is missing");
  }

  //ADD: delete old image.
  const avatar = await uploadOnCloud(avatarLocalPath);
  if (!avatar.url) {
    throw new apierror(402, "error while uploading on avatar");
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");
  return res.status(200).json(200, user, "avatar has been updated");
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverimgLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new apierror(402, "coverimage file is missing");
  }
  const coverimg = await uploadOnCloud(avatarLocalPath);
  if (!coverimg.url) {
    throw new apierror(402, "error while uploading the coverimage");
  }
  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverimg.url,
      },
    },
    { new: true }
  ).select("-password");
  return res.status(200).json(200, user, "coverimage has been updated");
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params; //gets user from url
  if (!username?.trim()) {
    throw new apierror(402, "username not found");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    }, //first we matched the user
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    }, //counted the subscriber of the user through channel
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    }, // counted the user has subribed to
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscriberdTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    }, //added aditional fields for subscriber count adn is subsribed for the frontend part id that will be shown as subscribe or subscribed.
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      }, // to project slected things .
    },
  ]);
  //this is aggregation pipeline used for the stages of operation in teh docunent so that one can openly mege or change any fields and have more fields in it by stages of operatioon through document scanin, read by docs of mongodb of aggregation pipeline.
  if (!channel?.length) {
    throw new apierror(402, "channel doesnt exist");
  }
  return res
    .status(200)
    .json(
      new apiresponse(200, channel[0], "user channel fetched successfully")
    );
});
const deleteCoverImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new apierror(403, "the user is not found.");
  }
  const coverimageurl = user.coverImage;
  if (!coverimageurl) {
    throw new apierror(402, "coverImage is not present");
  }
  const split = coverimageurl.split("/");
  const split2 = split[split.length - 1].split(".");
  const publicid = split2[0];
  console.log(publicid);
  const result = await deleteOldFile(publicid);
  await User.findByIdAndUpdate(req.user._id, {
    coverImage: "",
  });
  return res
    .status(200)
    .json(
      new apiresponse(200, result, "Coverimage has been deleted successfully")
    );
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getUserChannelProfile,
  deleteCoverImage,
};
