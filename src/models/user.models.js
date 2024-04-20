import { jwt } from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
const users = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverimage: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
      required: true,
    },
    watchhistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

users.pre("save", async (next) => {
  if (this.isModified("password")) {
    this.password = bcrypt.hash(this.password, 8);
    next();
  }
  else{
    next();
  }
});



users.methods.isPasswordCorrect = async function(pasword){
    return await bcrypt.compare(password,this.password)
}

users.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

users.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const Users = mongoose.model("User", users);
