const AppError = require('./../utils/AppError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFielsDB = err => {
  if (err.errmsg) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicated field value : ${value}. Please use another value!`;
    return new AppError(message, 400);
  }
  // در صورتی که errmsg وجود نداشته باشد، پیام عمومی‌تری به کاربر نمایش داده می‌شود
  return new AppError('Duplicate field value. Please use another value!', 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data . ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('Invalid token! Please log in again!', 401);

const handleExpiredTokenError = () =>
  new AppError('Your token has expired , Please log in again', 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  // Rendered WebSite
  console.error('ERROORR', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error : send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // B) Programming or other unknown error : dont leak error details
    // 1) Log Error
    console.error('ERROORR', err);
    // 2) Send generic Message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong !!!'
    });
  }
  // B) RENDERED WEBSITE
  // A) Operational, trusted error : send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // B) Programming or other unknown error : dont leak error details
  // 1) Log Error
  console.error('ERROORR', err);
  // 2) Send generic Message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    error.message = err.message;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFielsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleExpiredTokenError();
    sendErrorProd(error, req, res);
  }
};
