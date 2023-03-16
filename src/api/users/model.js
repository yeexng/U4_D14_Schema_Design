import mongoose from "mongoose";

const { Schema, model } = mongoose;

const usersSchema = new Schema(
  {
    userName: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("User", usersSchema);
