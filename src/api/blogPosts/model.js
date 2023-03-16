import mongoose from "mongoose";

const { Schema, model } = mongoose;

const blogPostsSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    author: {
      name: { type: String, required: true },
      avatar: { type: String, required: true },
    },
    content: { type: String, required: true },
    comments: [
      {
        username: { type: String, required: true },
        text: { type: String, required: true },
        rating: Number,
        createdAt: Date,
        updatedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

export default model("BlogPost", blogPostsSchema);
