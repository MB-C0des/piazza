const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Post creation validation
const validatePost = [
  body('title')
    .trim()
    .notEmpty().withMessage('Post title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('body')
    .trim()
    .notEmpty().withMessage('Post content is required')
    .isLength({ max: 5000 }).withMessage('Content cannot exceed 5000 characters'),
  body('topics')
    .isArray({ min: 1 }).withMessage('At least one topic is required')
    .custom((topics) => {
      const validTopics = ['Politics', 'Health', 'Sport', 'Tech'];
      return topics.every(topic => validTopics.includes(topic));
    }).withMessage('Invalid topic. Must be one of: Politics, Health, Sport, Tech'),
  body('expirationMinutes')
    .optional()
    .isInt({ min: 1 }).withMessage('Expiration time must be a positive integer'),
  handleValidationErrors
];

// Comment validation
const validateComment = [
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  handleValidationErrors
];

// Topic validation
const validateTopic = [
  param('topic')
    .isIn(['Politics', 'Health', 'Sport', 'Tech'])
    .withMessage('Invalid topic. Must be one of: Politics, Health, Sport, Tech'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePost,
  validateComment,
  validateTopic,
  handleValidationErrors
};