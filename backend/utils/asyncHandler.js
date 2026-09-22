/**
 * Wraps an async route handler to automatically catch errors
 * and forward them to Express error handling middleware.
 *
 * Usage:
 *   const asyncHandler = require('../utils/asyncHandler');
 *   exports.getItems = asyncHandler(async (req, res) => {
 *     const items = await Item.find();
 *     res.json({ success: true, data: items });
 *   });
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
