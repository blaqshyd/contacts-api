import dotenv from "dotenv";
import express, { json } from "express";
import connectDb from "./config/dbConnection.js";
import errorHandler from "./middleware/errorHandler.js";
import contactRoutes from "./routes/contactRoutes.js";
import userRoutes from "./routes/userRoutes.js";
dotenv.config();

// const dotenv = require("dotenv").config();

connectDb();
const app = express();
const port = process.env.PORT || 5000;

app.use(json());

app.get("/v1/", (req, res) =>
  res.json({
    code: res.statusCode,
    status: true,
    message: "Welcome to the Contact API",
    data: {
      name: "Blaqshyd",
      description: "A simple contact API",
      version: "1.0.0",
      author: "Blaqshyd",
    },
  })
);
app.use("/v1/contacts", contactRoutes);
app.use("/v1/users", userRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`E dey shake for port ${port}`);
});
