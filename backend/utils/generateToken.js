const jwt = require('jsonwebtoken');

const DEFAULT_JWT_EXPIRE = '7d';

/**
 * Sign a JWT for the given user id.
 * Throws a descriptive error when JWT_SECRET is not configured, instead of
 * the generic "secretOrPrivateKey must have a value" from jsonwebtoken.
 */
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Add it to backend/.env (see .env.example).');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || DEFAULT_JWT_EXPIRE,
  });
};

module.exports = generateToken;
