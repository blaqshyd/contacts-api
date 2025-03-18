import { statusCode } from "../constants.js";

const errorHandler = (err, req, res, next) => {
  const code = res.statusCode ? res.statusCode : 500;
  switch (code) {
    case statusCode.VALIDATION_ERROR:
      res.json({
        code: res.statusCode,
        message: err.message,
        stackTrace: err.stackTrace,
      });

    case statusCode.NOT_FOUND:
      res.json({
        code: res.statusCode,

        message: err.message,
        stackTrace: err.stackTrace,
      });

    case statusCode.UNAUTHORIZED:
      res.json({
        code: res.statusCode,

        message: err.message,
        stackTrace: err.stackTrace,
      });

    case statusCode.FORBIDDEN:
      res.json({
        code: res.statusCode,

        message: err.message,
        stackTrace: err.stackTrace,
      });
    case statusCode.SERVER_ERROR:
      res.json({
        code: res.statusCode,

        message: err.message,
        stackTrace: err.stackTrace,
      });
    default:
      console.log("No error, all good.");
      break;
  }
};

export default errorHandler;
