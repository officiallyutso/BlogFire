const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => `${err.param}: ${err.msg}`).join(', ');
    return next(new AppError(errorMessages, 400));
  }
  next();
};

exports.schemas = {
  user: {
    register: [
      { field: 'email', rules: ['required', 'email'] },
      { field: 'password', rules: ['required', 'min:6'] },
      { field: 'name', rules: ['required'] }
    ],
    login: [
      { field: 'email', rules: ['required', 'email'] },
      { field: 'password', rules: ['required'] }
    ]
  },
  
  post: {
    create: [
      { field: 'title', rules: ['required', 'min:3'] },
      { field: 'content', rules: ['required', 'min:10'] }
    ],
    update: [
      { field: 'title', rules: ['optional', 'min:3'] },
      { field: 'content', rules: ['optional', 'min:10'] }
    ]
  },
  
  comment: {
    create: [
      { field: 'content', rules: ['required', 'min:1'] }
    ]
  }
};