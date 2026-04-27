import { statusCode as sCode } from "../constants.js";

const errorHandler = (err, req, res, next) => {
  const code = res.statusCode ? res.statusCode : 500;

  console.log(code);

  switch (code) {
    case sCode.VALIDATION_ERROR:
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
        stackTrace: err.stackTrace,
      });
      break;
    case sCode.NOT_FOUND:
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
        stackTrace: err.stackTrace,
      });
      break;
    case sCode.UNAUTHORIZED:
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
        stackTrace: err.stackTrace,
      });
      break;
    case sCode.FORBIDDEN:
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
        stackTrace: err.stackTrace,
      });
      break;
    case sCode.SERVER_ERROR:
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
        stackTrace: err.stackTrace,
      });
      break;
    default:
      console.log(err.message);
      console.log(res.statusCode);
      res.json({
        code: res.statusCode,
        success: false,
        message: err.message,
        stackTrace: err.stackTrace,
      });

      break;
  }
};

export default errorHandler;
