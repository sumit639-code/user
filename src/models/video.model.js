import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
  {
    videofile: {
      type: String,
      requred: true,
    },
    thumbnail: {
      type: String,
      requred: true,
    },
    title: {
      type: String,
      requred: true,
    },
    description: {
      type: String,
      requred: true,
    },
    duration: {
      type: Number,
      requred: true,
    },
    views: {
      type: Number,
      requred: true,
    },
    isPublished: {
      type: Boolean,
      requred: true,
    },
  },
  { timestamps: true }
);


videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema);
