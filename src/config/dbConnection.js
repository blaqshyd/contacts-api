import mongoose from "mongoose";
import "./env.config.js";

const connectDb = async () => {
  const environment = process.env.NODE_ENV || "development"; // Default to development

  try {
    if (environment === "production") {
      await mongoose.connect(process.env.CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB connected (Production)");
    } else {
      // Connect to a local MongoDB instance in development
      await mongoose.connect("mongodb://localhost:27017/contacts-api", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB connected (Development)");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDb;
