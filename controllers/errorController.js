const errorController = function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";
  //   console.log(process.env.NODE_ENV);
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
  //   if (process.env.NODE_ENV === "development") {
  //   }
};

export default errorController;
