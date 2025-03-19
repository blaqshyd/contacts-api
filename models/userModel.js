import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Enter username"],
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Enter email address"],
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Enter password"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    avatar: {
      type: String,
      default: null,
    },

    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      language: {
        type: String,
        default: "en",
      },
      // Add other preference fields as needed
    },

    notificationSettings: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
      // Add other notification settings as needed
    },
  },
  {
    timestamps: true,
  }
);

export default model("User", userSchema);
