import mongoose from "mongoose";

const { Schema, model } = mongoose;

const contactSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Enter contact name"],
    },
    email: {
      type: String,
      required: [true, "Enter contact email"],
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Enter contact phone number"],
    },
  },
  {
    timestamps: true,
  }
);

export default model("Contact", contactSchema);
