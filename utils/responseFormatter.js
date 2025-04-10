exports.successResponse = (res, statusCode, data, message = '') => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

exports.errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: 'error',
    message
  });
};

exports.paginationResponse = (res, statusCode, data, page, limit, total) => {
  return res.status(statusCode).json({
    status: 'success',
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};