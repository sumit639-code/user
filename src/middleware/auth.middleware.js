import { User } from "../models/user.model.js";
import { apierror } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", ""); //here the cookie has the accestoken so that we can verify if the user is being logged in or not,
    //req.header can contian jwt header and  that contain this Authorization : Bearer <token> so to get the token we are using this method.
    
    if (!token) {
      throw new apierror(403, "unauthorised request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // in this we have givven the feilds like id name etc to encode the access token and that will generatethe access token.
    //secret  key is used to encode the accesstoken and used to decode the access token and helps to encode or decode.
    //this decoded id wil give all the feild that have been given while encoding the access token.

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    console.log(user);
    if (!user) {
      throw new apierror(404, "invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new apierror(404, "error");
  }
});
