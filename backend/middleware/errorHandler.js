const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

 
  if (err.name === 'SequelizeDatabaseError' && err.message.includes('invalid input syntax for type uuid')) {
    statusCode = 400;
    message = 'Resource not found or invalid ID format';
  }

  
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    const field = Object.keys(err.fields)[0];
    message = `Duplicate value for '${field}'. Please use another value.`;
  }

 
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(', ');
  }

  
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  console.error('❌ Error:', message);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
