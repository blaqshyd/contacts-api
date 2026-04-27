import mongoose from "mongoose";
import "./env.config.js";

const connectDb = async () => {
  const environment = process.env.NODE_ENV;

  try {
    if (environment === "production") {
      await mongoose.connect(process.env.CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB connected");
    } else {
      console.log("Running on localhost");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDb;
