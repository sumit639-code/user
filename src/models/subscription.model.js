import mongoose, { Schema, Types } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId, // one who is subscribing
      ref: "User",
    },

    channel: {
      type: mongoose.Schema.type.ObjectId, //one to whom subscriber is subscribing.
      ref: "User",
    },
  },
  { timestamps: true }
);
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
