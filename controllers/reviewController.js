const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('./FactoryFunction');

const sendData = (data, statusCode, res) => {
  res.status(statusCode).json({
    status: 'success',
    result: Array.isArray(data) ? data.length : undefined,
    data: {
      data
    }
  });
};

exports.setTourUserIds = (req, res, next) => {
  // Allow Nested Route
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
