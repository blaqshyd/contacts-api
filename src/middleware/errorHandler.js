import { errorResponse } from "../utils/responseHelper.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  if (err.isOperational) {
    statusCode = err.statusCode;
  }

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  if (err.name === "ValidationError" && !err.isOperational) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  if (process.env.NODE_ENV !== "production" && err.stack) {
    console.error(`[ERROR] ${statusCode} - ${message}\n${err.stack}`);
  }

  errorResponse(res, statusCode, message);
};

export default errorHandler;
