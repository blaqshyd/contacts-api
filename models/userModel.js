import { Schema, model } from "mongoose";

const userSchema = Schema(
  {
    username: {
      type: String,
      required: [true, "Enter username"],
    },

    email: {
      type: String,
      required: [true, "Enter email address"],
      unique: [true, "Email address already in use,"],
    },

    password: {
      type: String,
      required: [true, "Enter password"],
    },
  },
  {
    timestamps: true,
  }
);

export default model("User", userSchema);
