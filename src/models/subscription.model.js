import mongoose, { Schema, Types } from "mongoose";

const subscriptionSchema = new Schema({
  subscribe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  channel: {
    type: mongoose.Schema.type.ObjectId,
    ref: "User",
  },
});
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
