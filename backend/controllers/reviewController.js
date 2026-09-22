const { Review, MenuItem, Restaurant, User, Sequelize: { fn, col } } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const MAX_LIMIT = 50;


exports.createReview = asyncHandler(async (req, res) => {
  const { menuItemId, restaurantId, rating, comment } = req.body;

  const reviewData = {
    userId: req.user.id,
    rating,
    comment,
  };

  if (menuItemId) reviewData.menuItemId = menuItemId;
  if (restaurantId) reviewData.restaurantId = restaurantId;

  const review = await Review.create(reviewData);

  if (menuItemId) {
    const stats = await Review.findOne({
      attributes: [[fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('id')), 'count']],
      where: { menuItemId },
      raw: true,
    });
    if (stats) {
      await MenuItem.update({
        rating: Math.round(Number(stats.avgRating) * 10) / 10,
        numReviews: Number(stats.count),
      }, { where: { id: menuItemId } });
    }
  }

  if (restaurantId) {
    const stats = await Review.findOne({
      attributes: [[fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('id')), 'count']],
      where: { restaurantId },
      raw: true,
    });
    if (stats) {
      await Restaurant.update({
        rating: Math.round(Number(stats.avgRating) * 10) / 10,
        numReviews: Number(stats.count),
      }, { where: { id: restaurantId } });
    }
  }

  const fullReview = await Review.findByPk(review.id, {
    include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }]
  });

  res.status(201).json({ success: true, data: fullReview });
});


exports.getRestaurantReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const cappedLimit = Math.min(Number(limit) || 20, MAX_LIMIT);
  const offset = (page - 1) * cappedLimit;

  const { count, rows } = await Review.findAndCountAll({
    where: { restaurantId: req.params.id },
    order: [['createdAt', 'DESC']],
    limit: cappedLimit,
    offset,
    include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }]
  });

  res.json({
    success: true,
    data: rows,
    pagination: { page: Number(page), limit: cappedLimit, total: count, pages: Math.ceil(count / cappedLimit) },
  });
});


exports.getFoodReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const cappedLimit = Math.min(Number(limit) || 20, MAX_LIMIT);
  const offset = (page - 1) * cappedLimit;

  const { count, rows } = await Review.findAndCountAll({
    where: { menuItemId: req.params.id },
    order: [['createdAt', 'DESC']],
    limit: cappedLimit,
    offset,
    include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }]
  });

  res.json({
    success: true,
    data: rows,
    pagination: { page: Number(page), limit: cappedLimit, total: count, pages: Math.ceil(count / cappedLimit) },
  });
});


exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }
  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  await review.destroy();
  res.json({ success: true, message: 'Review deleted' });
});
