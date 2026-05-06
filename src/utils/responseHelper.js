export const successResponse = (res, code, message, data = null) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null) {
    response.data = data;
  }
  return res.status(code).json(response);
};

export const errorResponse = (res, code, message, error = null) => {
  const response = {
    success: false,
    message,
  };
  if (error !== null) {
    response.error = error;
  }
  return res.status(code).json(response);
};
