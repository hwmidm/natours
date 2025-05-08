const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Global Middleware

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// set Security HTTP Header
app.use(helmet());

// Logging
app.use(morgan('dev'));

// Set RateLimit for same IPs
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour'
});
app.use('/api', limiter);

// body parser , reading data from body into req.body
app.use(express.json('10Kb'));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'difficulty',
      'maxGroupSize',
      'ratingsAverage',
      'ratingsQuantity',
      'price'
    ]
  })
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],
      scriptSrc: [
        "'self'",
        'https://unpkg.com',
        'https://cdnjs.cloudflare.com',
        "'unsafe-inline'",
        "'unsafe-eval'"
      ],
      workerSrc: ["'self'", 'blob:'],
      styleSrc: [
        "'self'",
        'https://unpkg.com',
        "'unsafe-inline'",
        'https://fonts.googleapis.com'
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      connectSrc: [
        "'self'",
        'https://demotiles.maplibre.org',
        'https://api.maptiler.com',
        'ws:',
        'ws://localhost:*',
        'ws://127.0.0.1:*'
      ],
      imgSrc: ["'self'", 'data:', 'blob:']
    }
  })
);
app.use(
  cors({
    origin: true,
    credentials: true // برای اجازه دادن به ارسال کوکی‌ها
  })
);

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // });
  // next();

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
// 4) Start Server
module.exports = app;

