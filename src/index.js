import express from "express";
import morgan from "morgan";
import connectDb from "./config/dbConnection.js";
import { ensureConnected, closeClient as closeRedis } from "./config/redis_client.js";
import errorHandler from "./middleware/errorHandler.js";
import mainRouter from "./routes/index.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(morgan("combined"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/v1", mainRouter);
app.use(errorHandler);

let server;

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed");
      try {
        await closeRedis();
      } catch (err) {
        console.error("Error closing Redis:", err.message);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

const startServer = async () => {
  try {
    await connectDb();
    await ensureConnected();

    server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
