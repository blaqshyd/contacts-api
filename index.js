import dotenv from "dotenv";
import express, { json } from "express";
import http from "http";
import morgan from "morgan";
import connectDb from "./config/dbConnection.js";
import errorHandler from "./middleware/errorHandler.js";
import authRouter from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDb();
const app = express();
const port = process.env.PORT || 5000;

// Custom morgan format
morgan.token("customdate", () => new Date().toISOString());
app.use(
  morgan((tokens, req, res) => {
    return [
      // tokens.customdate(),
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);

app.use(json());

app.get("/v1/", (req, res) => {
  try {
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
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});
app.use("/v1/auth", authRouter);
app.use("/v1/contact", contactRoutes);
app.use("/v1/user", userRoutes);
app.use(errorHandler);

/** Create HTTP server. */
const server = http.createServer(app);

/** Listen on provided port, on all network interfaces. */
server.listen(port);
/** Event listener for HTTP server "listening" event. */
server.on("listening", () => {
  console.log(`Listening on port:: http://localhost:${port}/`);
});
