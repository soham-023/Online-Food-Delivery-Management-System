const { Restaurant, Sequelize } = require('../models');
const { Op } = Sequelize;
const asyncHandler = require('../utils/asyncHandler');
const { getImageUrl } = require('../middleware/upload');
const ApiError = require('../utils/apiError');

const MAX_LIMIT = 50;


exports.getRestaurants = asyncHandler(async (req, res) => {
  const { search, cuisine, rating, sort, page = 1, limit = 12 } = req.query;
  const cappedLimit = Math.min(Number(limit) || 12, MAX_LIMIT);
  const offset = (page - 1) * cappedLimit;
  
  const where = { isActive: true };

  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      
      Sequelize.literal(`CAST(cuisine AS TEXT) ILIKE '%${search}%'`)
    ];
  }

  if (cuisine) {
    where.cuisine = { [Op.contains]: cuisine.split(',') };
  }

  if (rating) {
    where.rating = { [Op.gte]: Number(rating) };
  }

  let order = [['createdAt', 'DESC']];
  if (sort === 'rating') order = [['rating', 'DESC']];
  else if (sort === 'name') order = [['name', 'ASC']];
  else if (sort === 'delivery') order = [['deliveryCharge', 'ASC']];

  const { count, rows } = await Restaurant.findAndCountAll({
    where,
    order,
    limit: cappedLimit,
    offset,
  });

  res.json({
    success: true,
    data: rows,
    pagination: {
      page: Number(page),
      limit: cappedLimit,
      total: count,
      pages: Math.ceil(count / cappedLimit),
    },
  });
});


exports.getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }
  res.json({ success: true, data: restaurant });
});


exports.createRestaurant = asyncHandler(async (req, res) => {
  req.body.ownerId = req.user.id;
  const imageUrl = getImageUrl(req);
  if (imageUrl) req.body.image = imageUrl;
  
  const restaurant = await Restaurant.create(req.body);
  res.status(201).json({ success: true, data: restaurant });
});


exports.updateRestaurant = asyncHandler(async (req, res) => {
  const imageUrl = getImageUrl(req);
  if (imageUrl) req.body.image = imageUrl;
  
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }
  
  await restaurant.update(req.body);
  
  res.json({ success: true, data: restaurant });
});


exports.deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }
  await restaurant.destroy();
  res.json({ success: true, message: 'Restaurant deleted' });
});
