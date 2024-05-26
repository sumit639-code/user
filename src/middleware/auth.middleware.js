import { User } from "../models/user.model.js";
import { apierror } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cokkie?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");
    if (!token) {
      throw new apierror(403, "unauthorised request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    await User.findById(decodedToken?._id).select("-password -refreshToken");
    if (!user) {
      throw new apierror(404, "invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new apierror(404,"error")
  }
});
