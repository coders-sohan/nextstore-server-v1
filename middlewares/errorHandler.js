// not found

const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  // pass the error to the next middleware
  next(error);
};

const errorHandler = (error, req, res, next) => {
  // set the status code to 500 if the status code is 200
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  // return the error message
  res.json({
    status: "fail...",
    message: error?.message,
    stack: error?.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
