import express from "express";
import morgan from "morgan";
import connectDb from "./config/dbConnection.js";
import errorHandler from "./middleware/errorHandler.js";
import mainRouter from "./routes/index.js";
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
  }),
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// API base path
app.use("/v1", mainRouter);
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
